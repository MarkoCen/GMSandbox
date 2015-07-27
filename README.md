# GMSandbox
----
GMSandbox is a light-weight library for easily adding customized markers on Google map, it has no dependency and very simple APIs.

[Demo]()

###Setup in 30sec

Download code from this repository or Bower, then include it on your web page:
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
