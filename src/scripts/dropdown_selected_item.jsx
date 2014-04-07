var DropdownSelectedItem = React.createClass({
  render: function(){
    return (
      <div className="dropdownSelectedItem" onClick={this.props.handleSelectedItemClick}>
        {this.props.name}
      </div>
    );
  }
});