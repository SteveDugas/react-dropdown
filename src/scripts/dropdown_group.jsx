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
        handleItemHoverChange={self.props.handleItemHoverChange}
        handleSelectedItemChange={self.props.handleSelectedItemChange}
        />
    });
    return(
      <div className="dropdownGroup">
        <span>{this.props.name}</span>
        {this.items}
      </div>
    );
  }
});