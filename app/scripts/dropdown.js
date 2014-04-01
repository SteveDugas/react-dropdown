/** @jsx React.DOM */
// TODO: Change the SelectedItem to be an Input with on Focus toggle the dropdown. Maybe on blur toggle also?
// TODO: With/without optgroups
var defaultDropdownState = {
  hoverId: null,
  searchTerm: '',
  open: false,
  selectedId: null,
  items: [],
  groups: []
};

var Dropdown = React.createClass({displayName: 'Dropdown',
  componentDidMount: function(){
    // Is there a way to avoid doing this?
    $(document).on("click",".dropdown",function(e){
      e.preventDefault();
      e.stopPropagation();
    });
  },
  getInitialState: function() {
    return _.extend(defaultDropdownState,{groups: this.props.groups});
  },
  handleSelectChange: function(newId){
    this.updateState({
      selectedId: newId,
      open: false,
      searchTerm: '',
      hoverId: null
    });
  },
  updateState: function(update){
    this.setState(_.extend(this.state,update));
  },
  toggleDropbox: function(){
    var open;
    if(this.state.open){
      open = { open: false, searchTerm: '', hoverId: null };
    }else{
      open = { open: true };
    }
    this.updateState(open);
  },
  dropdownBoxEl: function(){
    if(this.state.open === true){
      return DropdownBox( 
          {searchTerm:this.state.searchTerm,
          items:this.searchedGroups,
          onSelectedChange:this.handleSelectChange,
          open:this.state.open,
          toggleDropbox:this.toggleDropbox,
          updateState:this.updateState,
          hoverId:this.state.hoverId} )
    }
  },
  render: function(){
    var selectedItemId = this.state.selectedId;
    var allItems = _.flatten(_.map(this.state.groups,function(group){
      return group.items;
    })); // merge in state.items
    var selectedItem = _.find(allItems,function(item){
      return selectedItemId == item.id;
    }) || { id: null, name: 'Select an Option' }; // TODO: Add this default selection to options? Merge it into items as a real item?
    this.searchedGroups = filterGroupsFromSearchTerm(this.state.groups,this.state.searchTerm);
    return (
      React.DOM.div( {className:"dropdown"}, 
        DropdownSelectedItem(
          {id:selectedItem.id,
          name:selectedItem.name,
          toggleDropbox:this.toggleDropbox} ),
          this.dropdownBoxEl()
      )
    );
  }
});

// Change so it doesn't render DropdownBox if it's not shown

function filterGroupsFromSearchTerm(groups,term){
  var regex = new RegExp(term,'i');
  return _.filter(_.map(groups,function(group){
    return { name: group.name, items: _.filter(group.items,function(item){
      return regex.test(item.name);
    })};
  }),function(group){
    return group.items.length > 0;
  });
}

var DropdownSelectedItem = React.createClass({displayName: 'DropdownSelectedItem',
  handleClick: function(e){
    this.props.toggleDropbox();
  },
  render: function(){
    return (
      React.DOM.div( {className:"dropdownSelectedItem", id:this.props.id, onClick:this.handleClick}, 
        this.props.name
      )
    );
  }
});

var DropdownBox = React.createClass({displayName: 'DropdownBox',
  // After render, focus if open
  bodyClick: null,
  componentDidMount: function(){
    this.bodyClick = _.bind(this.handleBodyClick,this)
    if(this.props.open){
      $("body").on("keydown",this.handleBodyKeydown);
      $(document).on("click",this.bodyClick);
    }
  },
  componentWillUnmount: function(){
    $("body").off("keydown");
    $(document).off("click",this.bodyClick);
  },
  componentDidUpdate: function(){
    if(this.props.open){
      $(this.refs.dropbox.getDOMNode()).show()
    } else {
      var self = this;
      window.setTimeout(function(){
        $(self.refs.dropbox.getDOMNode()).hide()
      },500)
    }
  },
  handleBodyKeydown: function(e){
    if(e.which == 27){
      this.props.toggleDropbox();
    }
  },
  handleBodyClick: function(e){
    this.props.toggleDropbox();
  },
  moveHoverItem: function(direction){
    var itemsLength = _.reduce(_.map(this.props.items,function(group){
      return group.items.length;
    }),function(a,b){ return a+b; });
    var newHoverId = null;
    if(direction == "down"){
      if(this.props.hoverId !== null){
        if(this.props.hoverId+1 > itemsLength-1){
          newHoverId = 0;
        } else {
          newHoverId = this.props.hoverId+1;
        }
      } else {
        newHoverId = 0;
      }
    } else if(direction == "up") {
      if(this.props.hoverId-1 < 0){
        newHoverId = itemsLength-1;
      } else {
        newHoverId = this.props.hoverId-1;
      }
    }
    if(newHoverId !== null){
      this.props.updateState({
        hoverId: newHoverId
      });
    }
  },
  selectFromHover: function(){
    var self = this;
    var items = _.flatten(_.map(this.props.items,function(group){
      return group.items;
    }));
    var selected = _.find(items,function(item,index){
      return index == self.props.hoverId;
    });
    if(selected){
      this.props.onSelectedChange(selected.id);
    }
  },
  render: function(){
    var self = this;
    var key = -1;
    // tODO: change this.props.items to this.props.groups
    this.dropdownGroups = _.map(this.props.items,function(group){
      var subItems = group.items;
      var startingKey = key;
      key = key+group.items.length;
      return DropdownGroup(
        {key:startingKey,
        items:subItems,
        name:group.name,
        hoverId:self.props.hoverId,
        updateState:self.props.updateState,
        onSelectedChange:self.props.onSelectedChange})
    });
    var className = "dropdownBox ";
    className += ( this.props.open ? "open" : "close" );
    return (
      React.DOM.div( {className:className, ref:"dropbox"}, 
        DropdownSearch(
          {open:this.props.open,
          updateState:this.props.updateState,
          selectFromHover:this.selectFromHover,
          moveHoverItem:this.moveHoverItem,
          searchTerm:this.props.searchTerm}
        ),
        this.dropdownGroups
      )
    );
  }
});

var DropdownGroup = React.createClass({displayName: 'DropdownGroup',
  getItems: function(){
    return this.items;
  },
  render: function(){
    var key = this.props.key;
    var self = this;
    this.items = _.map(this.props.items,function(item){
      key++;
      return DropdownItem(
        {id:item.id,
        key:key,
        name:item.name,
        hoverId:self.props.hoverId,
        updateState:self.props.updateState,
        onSelectedChange:self.props.onSelectedChange})
    });
    return(
      React.DOM.div( {className:"dropdownGroup"}, 
        React.DOM.span(null, this.props.name),
        this.items
      )
    );
  }
});

var DropdownItem = React.createClass({displayName: 'DropdownItem',
  handleClick: function(e){
    this.props.onSelectedChange(this.props.id);
    e.stopPropagation();
  },
  handleMouseEnter: function(e){
    this.props.updateState({
      hoverId: this.props.key
    });
  },
  handleMouseLeave: function(e){
    if(this.props.hoverId == this.props.key){
      this.props.updateState({
        hoverId: null
      });
    }
  },
  render: function(){
    if(this.props.hoverId == this.props.key){
      className = "dropdownItem hover";
    } else {
      className = "dropdownItem";
    }
    return (
      React.DOM.div( {className:className,
        id:this.props.id,
        onClick:this.handleClick,
        onMouseEnter:this.handleMouseEnter,
        onMouseLeave:this.handleMouseLeave},  
          this.props.name
      )
    );
  }
});

var DropdownSearch = React.createClass({displayName: 'DropdownSearch',
  componentDidMount: function(){
    if(this.props.open){
      $(this.refs.input.getDOMNode()).val(this.props.searchTerm).focus();
    }
  },
  handleKeyUp: function(e){
    var searchTerm = $.trim($(this.refs.input.getDOMNode()).val());
    if(this.props.searchTerm !== $.trim(searchTerm)){
      this.props.updateState({
        searchTerm: searchTerm,
        hoverId: null
      });
    }
  },
  handleKeyDown: function(e){
    if(e.which == 38){ // up
      this.props.moveHoverItem("up");
    } else if(e.which == 40){ //down
      this.props.moveHoverItem("down");
    } else if(e.which == 13){ // enter
      this.props.selectFromHover();
    }
  },
  render: function(){
    return (
      React.DOM.div( {className:"dropdownSearch"}, 
        React.DOM.input( {ref:"input", onKeyUp:this.handleKeyUp, onKeyDown:this.handleKeyDown, updateFromKey:this.props.selectFromHover} ) 
      )
    );
  }
});