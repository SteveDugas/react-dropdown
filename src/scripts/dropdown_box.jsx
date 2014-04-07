var DropdownBox = React.createClass({
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
        handleItemHoverChange={self.props.handleItemHoverChange}
        handleSelectedItemChange={self.props.handleSelectedItemChange}
        />
    });
    var className = "dropdownBox";
    className += ( this.props.open ? " open" : " close" );
    return (
      <div className={className} ref="dropbox">
        <DropdownSearch
          open={this.props.open}
          searchTerm={this.props.searchTerm}
          handleSearchKeyDown={this.props.handleSearchKeyDown}
          handleSearchKeyUp={this.props.handleSearchKeyUp}
        />
        {this.dropdownGroups}
      </div>
    );
  }
});