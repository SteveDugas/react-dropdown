var DropdownItem = React.createClass({
  handleClick: function(e){
    this.props.handleSelectedItemChange(e,{selectedId: this.props.id});
  },
  handleMouseEnter: function(e){
    this.props.handleItemHoverChange(this.props.key)
  },
  handleMouseLeave: function(e){
    if(this.props.hoverId == this.props.key){
      this.props.handleItemHoverChange(null)
    }
  },
  render: function(){
    className = "dropdownItem";
    className += (this.props.hoverId == this.props.key ? " hover" : "" );
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