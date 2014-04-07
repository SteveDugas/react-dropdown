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

  handleSelectedItemClick: function(e){
    e.preventDefault();
    this.toggleDropbox();
  },
/***
 * Search Events
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
    var self = this;
    var items = _.flatten(_.map(this.searchedGroups(),function(group){
      return group.items;
    }));
    var selected = _.find(items,function(item,index){
      return index == self.state.hoverId;
    });
    if(selected){
      this.handleSelectedItemChange($.Event("click"),{ selectedId: selected.id});
    }
  },

  searchedGroups: function(){
    return filterGroupsFromSearchTerm(this.state.groups,this.state.searchTerm);
  },
  searchedItemsLength: function(){
    return _.reduce(_.map(this.searchedGroups(),function(group){
      return group.items.length;
    }),function(a,b){ return a+b; });
  },

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
  toggleDropbox: function(){
    var newState;
    if(this.state.open){
      newState = { open: false, searchTerm: '', hoverId: null };
    }else{
      newState = { open: true };
    }
    this.setState(newState);
  },
  dropdownBoxEl: function(groupsWithSearch){
    if(this.state.open === true){
      return <DropdownBox 
          searchTerm={this.state.searchTerm}
          groups={groupsWithSearch}
          handleSelectedItemChange={this.handleSelectedItemChange}
          open={this.state.open}
          toggleDropbox={this.toggleDropbox}
          hoverId={this.state.hoverId}
          handleItemHoverChange={this.handleItemHoverChange}
          handleSearchKeyUp={this.handleSearchKeyUp}
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
    var searchedGroups = this.searchedGroups();
    return (
      <div className="dropdown">
        <DropdownSelectedItem
          name={selectedItem.name}
          handleSelectedItemClick={this.handleSelectedItemClick}
          toggleDropbox={this.toggleDropbox} />
          {this.dropdownBoxEl(searchedGroups)}
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