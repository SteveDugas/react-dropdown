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
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

var Dropdown = React.createClass({displayName: 'Dropdown',
  bodyClick: null,
  componentDidMount: function(){
    // Is there a way to avoid doing this?
    $(document).on("click",".dropdown",function(e){
      e.preventDefault();
      e.stopPropagation();
    });
    this.bodyClick = _.bind(this.handleBodyClick,this);
  },
  componentDidUpdate: function(){
    if(this.state.open){
      $("body").on("keydown",this.handleBodyKeydown);
      $(document).on("click",this.bodyClick);
    } else {
      $("body").off("keydown");
      $(document).off("click",this.bodyClick);
    }
  },
  getInitialState: function() {
    return _.extend(defaultDropdownState,{groups: this.props.groups});
  },

/*
 * DropdownSelectedItems Events
 */
  handleSelectedItemClick: function(e){
    e.preventDefault();
    this.toggleDropbox();
  },
  handleBodyKeydown: function(e){
    if(e.which == 27){
      this.toggleDropbox();
    }
  },
  handleBodyClick: function(e){
    this.toggleDropbox();
  },

/***
 * DropdownSearch Events
 */
  handleSearchKeyUp: function(e,searchTerm){
    if(this.state.searchTerm !== searchTerm){
      this.setState({
        searchTerm: searchTerm,
        hoverId: null
      });
    }
  },
  handleSearchKeyDown: function(e){
    if(e.which == 38){        // up
      this.nextHoverIdUp();
    } else if(e.which == 40){ //down
      this.nextHoverIdDown();
    } else if(e.which == 13){ // enter
      this.selectFromEnterKey();
    }
  },
  nextHoverIdUp: function(){
    var itemsLength = this.searchedItemsLength();
    var hoverId = this.state.hoverId;
    var newHoverId = (hoverId-1 < 0 ? itemsLength-1 : hoverId-1);
    this.setState({ hoverId: newHoverId });
  },
  nextHoverIdDown: function(){
    var itemsLength = this.searchedItemsLength();
    var hoverId = (this.state.hoverId == null ? -1 : this.state.hoverId);
    var newHoverId = (hoverId+1 > itemsLength-1 ? 0 : hoverId + 1);
    this.setState({ hoverId: newHoverId });
  },
  selectFromEnterKey: function(){
    var items = this.allItems()
    var selected = _.find(items,function(item,index){
      return index == this.state.hoverId;
    },this);
    if(selected){
      this.handleSelectedItemChange($.Event("click"),{ selectedId: selected.id});
    }
  },

  searchedGroups: function(){
    return filterGroupsFromSearchTerm(this.props.groups,this.state.searchTerm);
  },
  searchedItems: function(){
    return filterItemsFromSearchTerm(this.props.items,this.state.searchTerm);
  },
  searchedItemsLength: function(){
    return _.reduce(_.map(this.searchedGroups(),function(group){
      return group.items.length;
    }),function(a,b){ return a+b; }) + this.searchedItems().length;
  },

/*
 * DropdownItem Events
 */
  handleSelectedItemChange: function(e,data){
    e.stopPropagation();
    this.setState({
      selectedId: data.selectedId,
      open: false,
      searchTerm: '',
      hoverId: null
    });
  },
  handleItemHoverChange: function(hoverId){
    this.setState({
      hoverId: hoverId
    });
  },

// Toggle the dropbox open/close
  toggleDropbox: function(){
    var newState;
    if(this.state.open){
      newState = { open: false, searchTerm: '', hoverId: null };
    }else{
      newState = { open: true };
    }
    this.setState(newState);
  },

  dropdownBoxEl: function(){
    var searchedGroups = this.searchedGroups();
    var searchedItems = this.searchedItems();
    if(this.state.open === true){
      return DropdownBox(
          {key:1,
          searchTerm:this.state.searchTerm,
          groups:searchedGroups,
          items:searchedItems,
          handleSelectedItemChange:this.handleSelectedItemChange,
          open:this.state.open,
          toggleDropbox:this.toggleDropbox,
          hoverId:this.state.hoverId,
          handleItemHoverChange:this.handleItemHoverChange,
          handleSearchKeyUp:this.handleSearchKeyUp,
          handleSearchKeyDown:this.handleSearchKeyDown} )
    }
  },
  allItems: function(){
    var groupItems = _.flatten(_.map(this.state.groups,function(group){
      return group.items;
    }));
    return _.extend(groupItems,this.props.items) // merge in state.items
  },
  render: function(){
    var selectedItemId = this.state.selectedId;
    var selectedItem = _.find(this.allItems(),function(item){
      return selectedItemId == item.id;
    }) || { id: null, name: 'Select an Option' }; // TODO: Add this default selection to options? Merge it into items as a real item?
    return (
      React.DOM.div( {className:"dropdown"}, 
      ReactCSSTransitionGroup( {className:"dropdown", transitionName:"dropdownBox", component:React.DOM.div}, 
        DropdownSelectedItem(
          {key:2,
          name:selectedItem.name,
          handleSelectedItemClick:this.handleSelectedItemClick,
          toggleDropbox:this.toggleDropbox} ),
          this.dropdownBoxEl()
      )
      )
    );
  }
});

function filterGroupsFromSearchTerm(groups,term){
  var regex = new RegExp(term,'i');
  return _.filter(_.map(groups,function(group){
    return { name: group.name, items: _.filter(group.items,function(item){
      return regex.test(item.name);
    })};
  }),function(group){
    return group.items.length > 0;
  });
};
function filterItemsFromSearchTerm(items,term){
  var regex = new RegExp(term,'i');
  return _.filter(items,function(item){
    return regex.test(item.name)
  })
};

/** @jsx React.DOM */
var DropdownBox = React.createClass({displayName: 'DropdownBox',
  render: function(){
    var key = -1;
    this.dropdownItems = _.map(this.props.items,function(item){
      key++;
      return DropdownItem(
        {id:item.id,
        key:key,
        name:item.name,
        hoverId:this.props.hoverId,
        handleItemHoverChange:this.props.handleItemHoverChange,
        handleSelectedItemChange:this.props.handleSelectedItemChange}
        )
    },this); 
    this.dropdownGroups = _.map(this.props.groups,function(group){
      var subItems = group.items;
      var startingKey = key;
      key = key+group.items.length;
      return DropdownGroup(
        {key:startingKey,
        items:subItems,
        name:group.name,
        hoverId:this.props.hoverId,
        handleItemHoverChange:this.props.handleItemHoverChange,
        handleSelectedItemChange:this.props.handleSelectedItemChange}
        )
    },this);
    return (
      React.DOM.div( {className:"dropdownBox", ref:"dropbox"}, 
        DropdownSearch(
          {searchTerm:this.props.searchTerm,
          handleSearchKeyDown:this.props.handleSearchKeyDown,
          handleSearchKeyUp:this.props.handleSearchKeyUp}
        ),
        this.dropdownItems,
        this.dropdownGroups
      )
    );
  }
});
/** @jsx React.DOM */
var DropdownGroup = React.createClass({displayName: 'DropdownGroup',
  render: function(){
    var key = this.props.key;
    this.items = _.map(this.props.items,function(item){
      key++;
      return DropdownItem(
        {id:item.id,
        key:key,
        name:item.name,
        hoverId:this.props.hoverId,
        handleItemHoverChange:this.props.handleItemHoverChange,
        handleSelectedItemChange:this.props.handleSelectedItemChange}
        )
    },this);
    return(
      React.DOM.div( {className:"dropdownGroup"}, 
        React.DOM.span(null, this.props.name),
        this.items
      )
    );
  }
});
/** @jsx React.DOM */
var DropdownItem = React.createClass({displayName: 'DropdownItem',
  handleClick: function(e){
    this.props.handleSelectedItemChange(e,{selectedId: this.props.id});
  },
  handleMouseEnter: function(e){
    this.props.handleItemHoverChange(this.props.key);
  },
  handleMouseLeave: function(e){
    if(this.props.hoverId == this.props.key){
      this.props.handleItemHoverChange(null);
    }
  },
  render: function(){
    className = "dropdownItem";
    className += (this.props.hoverId == this.props.key ? " hover" : "" );
    return (
      React.DOM.div( {className:className,
        id:this.props.id,
        onClick:this.handleClick,
        onMouseEnter:this.handleMouseEnter,
        onMouseLeave:this.handleMouseLeave}
      ,  
        this.props.name
      )
    );
  }
});
/** @jsx React.DOM */
var DropdownSearch = React.createClass({displayName: 'DropdownSearch',
  componentDidMount: function(){
    $(this.refs.input.getDOMNode()).val(this.props.searchTerm).focus();
  },
  handleKeyUp: function(e){
    var searchTerm = $.trim($(this.refs.input.getDOMNode()).val());
    this.props.handleSearchKeyUp(e,searchTerm)
  },
  render: function(){
    return (
      React.DOM.div( {className:"dropdownSearch"}, 
        React.DOM.input( {ref:"input", onKeyUp:this.handleKeyUp, onKeyDown:this.props.handleSearchKeyDown} ) 
      )
    );
  }
});
/** @jsx React.DOM */
var DropdownSelectedItem = React.createClass({displayName: 'DropdownSelectedItem',
  render: function(){
    return (
      React.DOM.div( {className:"dropdownSelectedItem", onClick:this.props.handleSelectedItemClick}, 
        this.props.name
      )
    );
  }
});