// TODO: Change the SelectedItem to be an Input with on Focus toggle the dropdown. Maybe on blur toggle also?
// TODO: With/without optgroups
var defaultDropdownState = {
  hoverId: null,
  searchTerm: '',
  open: false,
  selectedId: null,
  items: []
};

var Dropdown = React.createClass({
  componentDidMount: function(){
    // Is there a way to avoid doing this?
    $(document).on("click",".dropdown",function(e){
      e.preventDefault();
      e.stopPropagation();
    });
  },
  getInitialState: function() {
    return _.extend(defaultDropdownState,{items: this.props.items});
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
    this.setState(
      _.extend(this.state,update)
    );
  },
  toggleDropbox: function(){
    // TODO: Clean this up
    var open = {};
    if(this.state.open){
      open = { open: false, searchTerm: '', hoverId: null };
    }else{
      open = { open: true };
    }
    this.updateState(open);
  },
  render: function(){
    var selectedItemId = this.state.selectedId;
    // TODO: Change .items.items. to groups.items but it needs to be all of them?
    var allItems = _.flatten(_.map(this.state.items,function(items){
      return items.items;
    }));
    var selectedItem = _.find(allItems,function(item){
      return selectedItemId == item.id;
    }) || { id: -1, name: 'Select Something Dude' }; // TODO: Add this default selection to options? Merge it into items as a real item?
    var searchedGroups = filterGroupsFromSearchTerm(this.state.items,this.state.searchTerm);
    return (
      <div className="dropdown" onClick={this.stopClicks}>
        <DropdownSelectedItem
          id={selectedItem.id}
          name={selectedItem.name}
          toggleDropbox={this.toggleDropbox} />
        <DropdownBox 
          searchTerm={this.state.searchTerm}
          items={searchedGroups}
          onSelectedChange={this.handleSelectChange}
          open={this.state.open}
          toggleDropbox={this.toggleDropbox}
          updateState={this.updateState}
          hoverId={this.state.hoverId} />
      </div>
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
}

var DropdownSelectedItem = React.createClass({
  handleClick: function(e){
    this.props.toggleDropbox();
  },
  render: function(){
    return (
      <div className="dropdownSelectedItem" id={this.props.id} onClick={this.handleClick}>
        {this.props.name}
      </div>
    );
  }
});

var DropdownBox = React.createClass({
  // After render, focus if open
  componentDidMount: function(){
    if(this.props.open){
      $("body").on("keydown",this.handleBodyKeydown);
      $(document).on("click",this.handleBodyClick);
    }
  },
  componentWillUpdate: function(){
    $("body").off("keydown");
    $(document).off("click",this.handleBodyClick);
  },
  componentDidUpdate: function(){
    if(this.props.open){
      $("body").on("keydown",this.handleBodyKeydown);
      $(document).on("click",this.handleBodyClick);
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
      return <DropdownGroup
        key={startingKey}
        items={subItems}
        name={group.name}
        hoverId={self.props.hoverId}
        updateState={self.props.updateState}
        onSelectedChange={self.props.onSelectedChange}/>
    });
    var className = "dropdownBox ";
    className += ( this.props.open ? "open" : "close" );
    return (
      <div className={className} ref="dropbox">
        <DropdownSearch
          open={this.props.open}
          updateState={this.props.updateState}
          selectFromHover={this.selectFromHover}
          moveHoverItem={this.moveHoverItem}
          searchTerm={this.props.searchTerm}
        />
        {this.dropdownGroups}
      </div>
    );
  }
});

var DropdownGroup = React.createClass({
  getItems: function(){
    return this.items;
  },
  render: function(){
    var key = this.props.key;
    var self = this;
    this.items = _.map(this.props.items,function(item){
      key++;
      return <DropdownItem
        id={item.id}
        key={key}
        name={item.name}
        hoverId={self.props.hoverId}
        updateState={self.props.updateState}
        onSelectedChange={self.props.onSelectedChange}/>
    });
    return(
      <div className="dropdownGroup">
        <span>{this.props.name}</span>
        {this.items}
      </div>
    );
  }
});

var DropdownItem = React.createClass({
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
      <div className={className}
        id={this.props.id}
        onClick={this.handleClick}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}> 
          {this.props.name}
      </div>
    );
  }
});

var DropdownSearch = React.createClass({
  componentDidMount: function(){
    if(this.props.open){
      $(this.refs.input).focus();
    }
  },
  componentDidUpdate: function(){
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
      <div className="dropdownSearch">
        <input ref="input" onKeyUp={this.handleKeyUp} onKeyDown={this.handleKeyDown} updateFromKey={this.props.selectFromHover} /> 
      </div>
    );
  }
});