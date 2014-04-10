var DropdownGroup = React.createClass({
  render: function(){
    var key = this.props.key;
    this.items = _.map(this.props.items,function(item){
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
    return(
      <div className="dropdownGroup">
        <span>{this.props.name}</span>
        {this.items}
      </div>
    );
  }
});