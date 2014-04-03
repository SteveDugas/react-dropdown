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

var Dropdown = React.createClass({
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
  handleSearchKeyUp: function(){
    
  },
  handleSearchKeyDown: function(e){
    if(e.which == 38){ // up
      this.nextHoverIdUp();
    } else if(e.which == 40){ //down
      this.nextHoverIdDown();
    } else if(e.which == 13){ // enter
      this.selectFromEnterKey();
    }
  },

  searchedGroups: function(){
    return filterGroupsFromSearchTerm(this.state.groups,this.state.searchTerm);
  },
  /* Up/Down arrow key movements when focused on Searchbox */
  searchedItemsLength: function(){
    return _.reduce(_.map(this.searchedGroups(),function(group){
      return group.items.length;
    }),function(a,b){ return a+b; });
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

  /* Enter key when focused on Searchbox */
  selectFromEnterKey: function(){
    var self = this;
    var items = _.flatten(_.map(this.searchedGroups(),function(group){
      return group.items;
    }));
    var selected = _.find(items,function(item,index){
      return index == self.state.hoverId;
    });
    if(selected){
      this.handleSelectChange(selected.id);
    }
  },

  handleSelectChange: function(newId){
    this.setState({
      selectedId: newId,
      open: false,
      searchTerm: '',
      hoverId: null
    });
  },
  handleSelectedItemChange: function(e,data){
    this.setState({
      selectedId: data.selectedId,
      open: false,
      searchTerm: '',
      hoverId: null
    });
  },
  updateState: function(update){
    this.setState(_.extend(this.state,update));
  },
  updateHoverId: function(hoverId){
    this.setState({
      hoverId: hoverId
    })
  },
  updateSearchTerm: function(term){
    this.setState({
      searchTerm: term,
      hoverId: null
    })
  },
  toggleDropbox: function(){
    var open;
    if(this.state.open){
      open = { open: false, searchTerm: '', hoverId: null };
    }else{
      open = { open: true };
    }
    this.setState(open);
  },
  dropdownBoxEl: function(groupsWithSearch){
    if(this.state.open === true){
      return <DropdownBox 
          searchTerm={this.state.searchTerm}
          groups={groupsWithSearch}
          handleSelectChange={this.handleSelectChange}
          handleSelectedItemChange={this.handleSelectedItemChange}
          open={this.state.open}
          toggleDropbox={this.toggleDropbox}
          updateState={this.updateState}
          updateSearchTerm={this.updateSearchTerm}
          updateHoverId={this.updateHoverId}
          hoverId={this.state.hoverId}
          handleSearchKeyDown={this.handleSearchKeyDown} />
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
    var searchedGroups = filterGroupsFromSearchTerm(this.state.groups,this.state.searchTerm);
    return (
      <div className="dropdown">
        <DropdownSelectedItem
          id={selectedItem.id}
          name={selectedItem.name}
          toggleDropbox={this.toggleDropbox} />
          {this.dropdownBoxEl(searchedGroups)}
      </div>
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
  render: function(){
    var self = this;
    var key = -1;
    this.dropdownGroups = _.map(this.props.groups,function(group){
      var subItems = group.items;
      var startingKey = key;
      key = key+group.items.length;
      return <DropdownGroup
        key={startingKey}
        items={subItems}
        name={group.name}
        hoverId={self.props.hoverId}
        updateState={self.props.updateState}
        handleSelectedItemChange={self.props.handleSelectedItemChange}
        handleSelectChange={self.props.handleSelectChange}/>
    });
    var className = "dropdownBox ";
    className += ( this.props.open ? "open" : "close" );
    return (
      <div className={className} ref="dropbox">
        <DropdownSearch
          open={this.props.open}
          updateState={this.props.updateState}
          handleSearchKeyDown={this.props.handleSearchKeyDown}
          searchTerm={this.props.searchTerm}
        />
        {this.dropdownGroups}
      </div>
    );
  }
});

var DropdownGroup = React.createClass({
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
        handleSelectedItemChange={self.props.handleSelectedItemChange}
        handleSelectChange={self.props.handleSelectChange}/>
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
    this.props.handleSelectChange(this.props.id);
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
  render: function(){
    return (
      <div className="dropdownSearch">
        <input ref="input" onKeyUp={this.handleKeyUp} onKeyDown={this.props.handleSearchKeyDown} /> 
      </div>
    );
  }
});