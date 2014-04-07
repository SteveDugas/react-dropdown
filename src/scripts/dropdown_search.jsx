var DropdownSearch = React.createClass({
  componentDidMount: function(){
    if(this.props.open){
      $(this.refs.input.getDOMNode()).val(this.props.searchTerm).focus();
    }
  },
  handleKeyUp: function(e){
    var searchTerm = $.trim($(this.refs.input.getDOMNode()).val());
    this.props.handleSearchKeyUp(e,searchTerm)
  },
  render: function(){
    return (
      <div className="dropdownSearch">
        <input ref="input" onKeyUp={this.handleKeyUp} onKeyDown={this.props.handleSearchKeyDown} /> 
      </div>
    );
  }
});