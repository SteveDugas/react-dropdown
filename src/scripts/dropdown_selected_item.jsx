var DropdownSelectedItem = React.createClass({
  render: function(){
    return (
      <div className="dropdownSelectedItem">
        <input value={this.props.name} readonly onClick={this.props.handleSelectedItemClick} />
      </div>
    );
  }
});