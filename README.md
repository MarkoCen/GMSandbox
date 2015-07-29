# GMSandbox
----
GMSandbox is a light-weight library for easily adding customized markers on Google map, it has no dependency and very simple APIs.

[Demo](http://markocen.github.io/GMSandbox/demo.html)

###Setup in 30sec

Download code from this repository or `bower install gm-sandbox`, then include it on your web page:
```html
<script type='text/javascript' src='GMSandbox.js'></script>
```
That's it! You don't worry about Google Map API, GMSandbox would lazy load Google Map API and initilize Google map after you instantiated GMSandbox.

###Get Started

The library would expose a `GMSandbox` class to your global environment, in order to use GMSandbox, you should do two things:  
  
1 Create `GMSandbox` instance    
```javascript
var gmSandbox = new GMSandbox();
```
2 Call `init` method
```javascript
gmSandbox.init(mapOptions, function(map){

  // callback logic ...

})
```
`init` method would lazy load Google Map API to your page, and create a Google map based on `mapOptions`

###APIs

#####Constructor GMSandbox([map])
arguments:     
  - **`map`** { google.maps.Map } Optional.    
    A Google map object would be used by GMSandbox. If it is undefined, GMSandbox would create a map object in `init` method 
   

#####GMSandbox.prototype.init(options, callback)    
arguments:
 - **`options`** { String | Object }     
   DOM element selector string or options object which contains following properties:    

   `element` { String }: DOM element selector string    
   `apiKey` { String }: Google Map API Key you obtained, if it is undefined, GMSandbox would try to use [signed-in map](https://developers.google.com/maps/documentation/javascript/signedin?hl=en)    
   `mapType` { String }: the type of initialzed Google map, include `ROADMAP`, `SATELLITE`, `TERRAIN`, `HYBRID`    
   
   you can also add any other properties support by [google.maps.MapOptions](https://developers.google.com/maps/documentation/javascript/3.exp/reference#MapOptions), note that, some of those properties may not works until you initilized Google map API on your page.
   
 - **`callback`** { Function }: callback function would be invoked when the map initializing finished, the new map would be passed into this function    

#####GMSandbox.prototype.addCustomMarker(options)    
Add a customized marker on map    
arguments:
 - **`options`** { Object }
  defined marker properties:    
    
  `template` { String }: HTML string would be displayed in marker content
  `location` { String }: Address string or LatLng object(ex: `{ lat: 43.1234, lng: 11.3322}`) to determine marker geo location    
  `anchor` { String }: Set anchor position of this marker, include `topCenter`, `center`, `bottomCenter`, `leftCenter`, `rightCenter`, `topLeft`, `topRight`, `bottomLeft`, `bottomRight`    
  `draggable` { Boolean }: Set if marker draggable on map    
  `name` { String }: Set the marker's name, you can use name to focus or retrieve related marker on map    

#####GMSandbox.prototype.focusMarker(marker)
set the center of map to a specific marker    

arguments:   
 - **`marker`** { String | Marker }: A marker name or a marker object return by `findMarker`    

#####GMSandbox.prototype.findMarker(markerName)
find a specific marker on map    
arguments:    
 - **`markerName`** { String }: marker name defined when marker created
    
return:    
 - **`marker`** { Object }: marker object which contains:    
   `name` { String }: the name of this marker    
   `position` { Object }: the LatLng position of this marker    
   `marker` { Object }: customized marker object    

#####GMSandbox.prototype.getMap()
get the map object which GMSandbox relied on    
    
return:    
 - **`map`** { google.maps.Map }    
 
#####GMSandbox.prototype.setMapType(typeName)
set the Google map type    
    
arguments:    
 - **`typeName`** { String }: the type of Google map, include `ROADMAP`, `SATELLITE`, `TERRAIN`, `HYBRID`    
 
#####GMSandbox.prototype.on(eventName, eventHandler)
bind event handler on a map event    
    
arguments:    
 - **`eventName`** { String }: valid event name defined by [google.maps.Map event](https://developers.google.com/maps/documentation/javascript/3.exp/reference#Map)    
 - **`eventHandler`** { Function }: event handling function
   

