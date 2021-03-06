//alert( "icecrepe" );

var global = this;
var icecrepe = icecrepe || {};

opjs.document.set( document );

(function( application ){
  application.clear = function( args ){
    var id = args[ 0 ];
    var result = opjs.document.element.get( id );
    if ( null !== result ){
      opjs.document.element.remove( result.parentNode, result );
    }
  };
  
  application.insert_result = function( args ){
    var id = args[ 0 ];
    var html = args[ 1 ];
    application.clear( [ id ] );
    var body = opjs.document.get().body;
    var styles = [
      "z-index : 2147483647",
      "position : fixed",
      "top : 0px",
      "left : 0px",
      "color : white",
      "background-color : black",
      "width : 100%",
      "height : 100%",
      "overflow : auto",
    ];
    body.innerHTML = opjs.string.format( "{0}<div id='{1}' style='{2}'>{3}</div>", body.innerHTML, id, styles.join( ";" ), html );
  };
  
  application.xpath = function( args ){
    var expression = args[ 0 ];
    var measure_time = new opjs.time.MeasureTime();
    var results = [];
    var result = opjs.document.xpath.iterators( expression );
    var errmsg = "";
    do{
      if ( ! ( "iterateNext" in result ) ){
        errmsg = result.msg;
        break;
      }
      
      var node = result.iterateNext();
      if ( null === node ) break;
      
      var attributes = {};
      opjs.array.each( node.attributes, function( attr, i ){
        attributes[ attr.nodeName ] = attr.nodeValue;
      });
      results.push([ node.nodeName, attributes, node.innerHTML ]);
    }while ( true );
    return [ measure_time.update(), opjs.json.encode( results ), errmsg ];
  };
  
  application.regex = function( args ){
    var expression = args[ 0 ];
    var measure_time = new opjs.time.MeasureTime();
    var results = [];
    var text = opjs.document.element.tags( "html" )[ 0 ].innerHTML;
    var pattern = new opjs.Pattern( undefined, expression );
    var result;
    var errmsg = "";
    while ( null !== ( result = pattern.match( text ) ) ){
      results.push( result.matches );
      text = result.tail;
    }
    return [ measure_time.update(), opjs.json.encode( results ), errmsg ];
  };
})(icecrepe.application = icecrepe.application || {});

chrome.extension.onMessage.addListener( function( request, sender, responseMethod ){
  var response = null;
  if ( "method" in request ){
    if ( ! ( "args" in request ) ) request.args = [];
    response = opjs.method.call( global, request.method, request.args );
  }
  if ( null === response ) return;
  
  if ( opjs.is_def( responseMethod ) ) responseMethod( response );
});
