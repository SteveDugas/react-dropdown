// TODO: Change the SelectedItem to be an Input with on Focus toggle the dropdown. Maybe on blur toggle also?
// TODO: Scroll page down as selection moves
var defaultDropdownState = {
  hoverId: null,
  searchTerm: '',
  open: false,
  selectedId: null
};
var defaultDropdownProps = {
  items: [],
  groups: []
}
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

var Dropdown = React.createClass({
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
    return defaultDropdownState;
  },
  getDefaultProps: function(){
    return defaultDropdownProps;
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
    var itemsLength = this.searchedAllLength();
    var hoverId = this.state.hoverId;
    var newHoverId = (hoverId-1 < 0 ? itemsLength-1 : hoverId-1);
    this.setState({ hoverId: newHoverId });
  },
  nextHoverIdDown: function(){
    var itemsLength = this.searchedAllLength();
    var hoverId = (this.state.hoverId == null ? -1 : this.state.hoverId);
    var newHoverId = (hoverId+1 > itemsLength-1 ? 0 : hoverId + 1);
    this.setState({ hoverId: newHoverId });
  },
  selectFromEnterKey: function(){
    var items = this.searchedAll();
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
  searchedAll: function(){
    var items = this.searchedItems();
    var groupedItems = _.flatten(_.map(this.searchedGroups(),function(group){
      return group.items
    }))
    return items.concat(groupedItems);
  },
  searchedAllLength: function(){
    return this.searchedAll().length;
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
    $(this).trigger("change",{ selected: data.selectedId });
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
      return <DropdownBox
          key={1}
          searchTerm={this.state.searchTerm}
          groups={searchedGroups}
          items={searchedItems}
          handleSelectedItemChange={this.handleSelectedItemChange}
          open={this.state.open}
          toggleDropbox={this.toggleDropbox}
          hoverId={this.state.hoverId}
          handleItemHoverChange={this.handleItemHoverChange}
          handleSearchKeyUp={this.handleSearchKeyUp}
          handleSearchKeyDown={this.handleSearchKeyDown} />
    }
  },
  allItems: function(){
    var groupItems = _.flatten(_.map(this.props.groups,function(group){
      return group.items;
    }));
    return this.props.items.concat(groupItems)
  },
  render: function(){
    var selectedItemId = this.state.selectedId;
    var selectedItem = _.find(this.allItems(),function(item){
      return selectedItemId == item.id;
    }) || { id: null, name: 'Select an Option' }; // TODO: Add this default selection to options? Merge it into items as a real item?
    return (
      <ReactCSSTransitionGroup className="dropdown" transitionName="dropdownBox" component={React.DOM.div}>
        <DropdownSelectedItem
          key={2}
          name={selectedItem.name}
          handleSelectedItemClick={this.handleSelectedItemClick}
          toggleDropbox={this.toggleDropbox} />
          {this.dropdownBoxEl()}
      </ReactCSSTransitionGroup>
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
