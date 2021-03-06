var DropdownBox = React.createClass({
  render: function(){
    var key = -1;
    this.dropdownItems = _.map(this.props.items,function(item){
      key++;
      return <DropdownItem
        id={item.id}
        key={key}
        name={item.name}
        hoverId={this.props.hoverId}
        handleItemHoverChange={this.props.handleItemHoverChange}
        handleSelectedItemChange={this.props.handleSelectedItemChange}
        />
    },this); 
    this.dropdownGroups = _.map(this.props.groups,function(group){
      var subItems = group.items;
      var startingKey = key;
      key = key+group.items.length;
      return <DropdownGroup
        key={startingKey}
        items={subItems}
        name={group.name}
        hoverId={this.props.hoverId}
        handleItemHoverChange={this.props.handleItemHoverChange}
        handleSelectedItemChange={this.props.handleSelectedItemChange}
        />
    },this);
    return (
      <div className={"dropdownBox"} ref="dropbox">
        <DropdownSearch
          searchTerm={this.props.searchTerm}
          handleSearchKeyDown={this.props.handleSearchKeyDown}
          handleSearchKeyUp={this.props.handleSearchKeyUp}
        />
        {this.dropdownItems}
        {this.dropdownGroups}
      </div>
    );
  }
});