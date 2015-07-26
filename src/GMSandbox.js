/**
 *
 * GMSandbox v0.0.1
 * https://www.github.com/MarkoCen/GMSandbox.git
 * Author: Marko Cen
 * License: MIT
 *
 */


(function(global){

    'use strict';

    /**
     * GMSandbox Constructor
     *
     * @param map {google.maps.Map} optionally google map object
     * @constructor
     */
    var GMSandbox = function(map){

        this.initDone = false;
        this.instance = null;
        this.mapOptions = null;
        this.element = null;
        this.userInitCallback = null;
        this.geoService = null;
        this.markers = [];
        this.mousePosition = {};

        this.zoomLevel = 13;

        //If a map already initialized, just init GMSandbox object on that map
        if(map){
            try{
                if(map instanceof google.maps.Map){
                    this.instance = map;
                    this.element = document.querySelector(map.element);
                    this.geoService = new global.google.maps.Geocoder();
                    this.CustomizedMarker
                        = GMSandbox.CustomizedMarker
                        = this.initClasses(global.google);
                    google.maps.event.addListener(this.instance, 'mousemove',
                        this._mapMouseMoveHandler.bind(this));
                    this.initDone = true;

                    GMSandbox.registInstance.push(this);
                }
            }catch(ex){
                throw "Invalid Map Object: " + map;
            }
        }


    };



    /**
     * Store all GMSandbox instances
     * @type {Array}
     */
    GMSandbox.registInstance = [];



    /**
     * This method would be called automatically when Google Map Api loaded
     *
     * @param isBrowser {Boolean}, default to false, if you call this method
     * manually, you should set this param to true
     */
    GMSandbox.initCallback = function(isBrowser){

        if(!global.google){
            if(isBrowser){
                return;
            }
            throw 'Google Map Javascript API Not Found!';
        }


        //Initializing related properties in all GMSandbox instances
        // when Google Map Api ready
        for(var i = 0, ii = GMSandbox.registInstance.length; i < ii; i++){

            var self = GMSandbox.registInstance[i];

            if(self.initDone){
                continue;
            }

            self.geoService = new global.google.maps.Geocoder();

            self.instance = new global.google.maps.Map(self.element, self.mapOptions);

            self.CustomizedMarker = GMSandbox.CustomizedMarker = self.initClasses(global.google);

            google.maps.event.addListener(self.instance, 'mousemove', self._mapMouseMoveHandler.bind(self));

            self.instance.setMapTypeId(google.maps.MapTypeId[self.mapOptions.mapType]);

            if(typeof self.userInitCallback === 'function')
            {
                self.userInitCallback(self.instance);

            }

            self.initDone = true;

        }

    };



    /**
     * This method would lazy load Google map api to current page,
     * and initialize a Google Map object based on @options,
     * then invoke @callback function
     *
     * @param options {Object}
     * @param callback {Function}
     */
    GMSandbox.prototype.init = function(options, callback){

        //If GMSandbox object already have a Google map property, then ignore
        //this method
        if(this.instance){
            return;
        }

        var _src = '';
        var noKey = false;
        var noCallback = false;

        //Determine the number and type of arguments
        switch (arguments.length){
            case 0:{
                throw "An DOM Element Is Needed To Initialize Google Map";
                break;
            }
            case 1:{
                if(typeof options === 'string'){
                    if(!document.querySelector(options))
                    {
                        throw "An DOM Element Is Needed To Initialize Google Map";
                    }
                }else{
                    if(!this._isElement(options)
                        && !document.querySelector(options.element)
                        && !this._isElement(options.element))
                    {
                        throw "An DOM Element Is Needed To Initialize Google Map";
                    }
                }
                noKey = (options.apiKey == null);
                noCallback = true;
                break;
            }
            case 2:{
                if(typeof options === 'string'){
                    if(!document.querySelector(options))
                    {
                        throw "An DOM Element Is Needed To Initialize Google Map";
                    }
                }else{
                    if(!this._isElement(options)
                        && !document.querySelector(options.element)
                        && !this._isElement(options.element))
                    {
                        throw "An DOM Element Is Needed To Initialize Google Map";
                    }
                }
                noKey = (options.apiKey == null);
                noCallback = (typeof callback !== 'function');
                break;
            }
            default:{
                throw "Wrong Augments Number"
            }
        }


        //Try to use signed-in map when Google Map api key not provided
        if(noKey){
            _src = 'http://maps.googleapis.com/maps/api/js' +
                '?v=3&callback=GMSandbox.initCallback&signed_in=true';
        }else{
            _src = 'http://maps.googleapis.com/maps/api/js' +
                '?v=3&callback=GMSandbox.initCallback&key=' + options.apiKey;
        }



        //Lazy load Google Map api script on page
        var script = document.createElement('script');
        script.id = 'GMSandbox_Google_Map_API';
        script.type = 'text/javascript';
        script.src = _src;


        //Set map options and callback properties
        this.mapOptions = this._defineOptions(options);
        this.userInitCallback = callback;

        if(typeof options === 'string'){
            this.element = document.querySelector(options);
        }else{
            if(this._isElement(options)){
                this.element = options;
            }else{
                if(typeof options.element === 'string'){
                    this.element = document.querySelector(options.element);
                }else{
                    this.element = options.element;
                }
            }

        }

        //Register new GMSandbox object
        GMSandbox.registInstance.push(this);

        try{
            if(!document.querySelector('#GMSandbox_Google_Map_API'))
            {
                document.head.appendChild(script);
            }
        }catch(ex){
            throw "Failed to initialize Google Map: " + ex;
        }


        //Try init Google Map manually
        GMSandbox.initCallback(true);


    };



    /**
     * After Google Map api loaded, called this method to create Google Map
     * related class
     * @param google {Google}
     * @returns {Function}
     */
    GMSandbox.prototype.initClasses = function(google){


        /**
         * Google Map customized marker constructor
         * @param html {String}
         * @param position {google.maps.LatLng}
         * @param parent {GMSandbox}
         * @param anchor {String}
         * @param draggable {Boolean}
         * @constructor
         */
        var CustomizedMarker =

            function(html, position, parent, anchor, draggable){

                var div = document.createElement('div');
                div.style.position = 'absolute';
                div.innerHTML = html;

                google.maps.event.addDomListener(div, 'mousedown', function(event){
                    this._dragMarker(event);
                }.bind(this));


                this.draggable = draggable || false;

                this.anchor = anchor || 'bottomCenter';

                this.template = div;

                this.position = position;

                this.parent = parent;

                this.setMap(parent.instance);

            };


        //Extend CustomizedMarker from google.maps.OverlayView Class
        CustomizedMarker.prototype  = new google.maps.OverlayView();

        CustomizedMarker.prototype._dragMarker = function(mouseDownEvent){

            if(this.draggable){

                event.preventDefault();

                event.stopPropagation();

                var mouseDownY = mouseDownEvent.clientY;
                var mouseDownX = mouseDownEvent.clientX;

                var div = this.template;

                var offsetY = mouseDownY - div.offsetTop;
                var offsetX = mouseDownX - div.offsetLeft;

                var mouseMoveHandler = google.maps.event.addListener(

                    this.parent.instance,

                    'mousemove',

                    function(event){

                        this.template.style.top = event.pixel.y - offsetY + 'px';
                        this.template.style.left = event.pixel.x - offsetX + 'px';

                    }.bind(this)
                );

                google.maps.event.addListenerOnce(

                    this.parent.instance,

                    'mouseup',

                    function(){

                        google.maps.event.removeListener(mouseMoveHandler);
                        this._domPositionToLatLng();

                    }.bind(this)
                );
            }

        };

        CustomizedMarker.prototype._domPositionToLatLng =

            function(){

                var div = this.template;
                var pixelPosition = {};
                var anchor = this.anchor;

                switch(anchor.toLowerCase()) {
                    case 'bottomcenter' :
                    {
                        pixelPosition.y = div.offsetTop + div.offsetHeight;
                        pixelPosition.x = div.offsetLeft + div.offsetWidth / 2;
                        break;
                    }
                    case 'center' :
                    {
                        pixelPosition.y = div.offsetTop + div.offsetHeight / 2;
                        pixelPosition.x = div.offsetLeft + div.offsetWidth / 2;
                        break;
                    }
                    case 'topcenter' :
                    {
                        pixelPosition.y = div.offsetTop;
                        pixelPosition.x = div.offsetLeft + div.offsetWidth / 2;
                        break;
                        break;
                    }
                    case 'leftcenter' :
                    {
                        pixelPosition.y = div.offsetTop + div.offsetHeight / 2;
                        pixelPosition.x = div.offsetLeft;
                        break;
                    }
                    case 'rightcenter' :
                    {
                        pixelPosition.y = div.offsetTop + div.offsetHeight / 2;
                        pixelPosition.x = div.offsetLeft + div.offsetWidth;
                        break;
                    }
                    case 'topleft' :
                    {
                        pixelPosition.y = div.offsetTop;
                        pixelPosition.x = div.offsetLeft;
                        break;
                    }
                    case 'topright' :
                    {
                        pixelPosition.y = div.offsetTop;
                        pixelPosition.x = div.offsetLeft + div.offsetWidth;
                        break;
                    }
                    case 'bottomleft' :
                    {
                        pixelPosition.y = div.offsetTop + div.offsetHeight;
                        pixelPosition.x = div.offsetLeft;
                        break;
                    }
                    case 'bottomright' :
                    {
                        pixelPosition.y = div.offsetTop + div.offsetHeight;
                        pixelPosition.x = div.offsetLeft + div.offsetWidth;
                        break;
                    }
                    default :
                    {
                        pixelPosition.y = div.offsetTop + div.offsetHeight;
                        pixelPosition.x = div.offsetLeft + div.offsetWidth / 2;
                        break;
                    }
                }


                var overlayProjection = this.getProjection();

                var gPixelPoint = new google.maps.Point(pixelPosition.x, pixelPosition.y);

                this.position = overlayProjection.fromDivPixelToLatLng(gPixelPoint);

            };

        CustomizedMarker.prototype._latLngToDomPosition =

            function(){

                var overlayProjection = this.getProjection();


                var pixelPosition = overlayProjection.fromLatLngToDivPixel(this.position);

                var div = this.template;
                var anchor = this.anchor.toLowerCase();

                switch(anchor){
                    case 'bottomcenter' : {
                        div.style.left = ( pixelPosition.x - div.offsetWidth / 2 )+ 'px';
                        div.style.top = ( pixelPosition.y - div.offsetHeight )+ 'px';
                        break;
                    }
                    case 'center' : {
                        div.style.left = ( pixelPosition.x - div.offsetWidth / 2 )+ 'px';
                        div.style.top = ( pixelPosition.y - div.offsetHeight / 2 )+ 'px';
                        break;
                    }
                    case 'topcenter' : {
                        div.style.left = ( pixelPosition.x - div.offsetWidth / 2 )+ 'px';
                        div.style.top = ( pixelPosition.y )+ 'px';
                        break;
                    }
                    case 'leftcenter' : {
                        div.style.left = ( pixelPosition.x)+ 'px';
                        div.style.top = ( pixelPosition.y - div.offsetHeight / 2 )+ 'px';
                        break;
                    }
                    case 'rightcenter' : {
                        div.style.left = ( pixelPosition.x - div.offsetWidth)+ 'px';
                        div.style.top = ( pixelPosition.y - div.offsetHeight / 2 )+ 'px';
                        break;
                    }
                    case 'topleft' : {
                        div.style.left = ( pixelPosition.x )+ 'px';
                        div.style.top = ( pixelPosition.y )+ 'px';
                        break;
                    }
                    case 'topright' : {
                        div.style.left = ( pixelPosition.x - div.offsetWidth)+ 'px';
                        div.style.top = ( pixelPosition.y )+ 'px';
                        break;
                    }
                    case 'bottomleft' : {
                        div.style.left = ( pixelPosition.x )+ 'px';
                        div.style.top = ( pixelPosition.y - div.offsetHeight )+ 'px';
                        break;
                    }
                    case 'bottomright' : {
                        div.style.left = ( pixelPosition.x - div.offsetWidth)+ 'px';
                        div.style.top = ( pixelPosition.y - div.offsetHeight)+ 'px';
                        break;
                    }
                    default :{
                        div.style.left = ( pixelPosition.x - div.offsetWidth / 2 )+ 'px';
                        div.style.top = ( pixelPosition.y - div.offsetHeight )+ 'px';
                        break;
                    }
                }

            };


        CustomizedMarker.prototype.onAdd =

                function(){

                    var panes = this.getPanes();
                    panes.overlayMouseTarget.appendChild(this.template);

                };

        CustomizedMarker.prototype.draw =

                function() {

                    this._latLngToDomPosition();

                };

        CustomizedMarker.prototype.onRemove =

                function () {

                    this.template.parentNode.removeChild(this.template);


                };

        return CustomizedMarker;

    };


    GMSandbox.prototype._mapMouseMoveHandler = function(event){
        this.mousePosition = event.latLng;
    };

    GMSandbox.prototype._isElement = function (o){
        return (
            typeof HTMLElement === "object" ? o instanceof HTMLElement : o
            && typeof o === "object"
            && o !== null
            && o.nodeType === 1
            && typeof o.nodeName==="string"
        );
    };

    GMSandbox.prototype._defineOptions = function (options) {

        var _defaultOption = {
            mapType: 'ROADMAP',
            zoom: 8,
            center: { lat: 42.358421, lng: -71.060934},
            panControl: false,
            streetViewControl: false,
            disableDoubleClickZoom: true,
            mapTypeControl: false
        };

        if(typeof options === 'string' || this._isElement(options)){
            return _defaultOption;
        }

        var mapTypeId = options.mapType.toUpperCase();

        options.mapType = (mapTypeId === 'ROADMAP' || mapTypeId === 'SATELLITE'
            || mapTypeId === 'TERRAIN' || mapTypeId === 'HYBRID') ?
            mapTypeId : 'ROADMAP';

        options.zoom = (options.zoom === undefined || options.zoom === null) ?
            8 : options.zoom;

        options.center = (options.center === undefined || options.center === null) ?
        { lat: 42.358421, lng: -71.060934} : options.center;

        options.panControl = (options.panControl === undefined
            || options.panControl === null) ? false : options.panControl;

        options.streetViewControl = (options.streetViewControl === undefined
            || options.streetViewControl === null) ? false : options.streetViewControl;

        options.disableDoubleClickZoom = (options.disableDoubleClickZoom === undefined
            || options.disableDoubleClickZoom === null) ? true : options.disableDoubleClickZoom;

        options.mapTypeControl = (options.mapTypeControl === undefined
            || options.mapTypeControl === null) ? false : options.mapTypeControl;

        return options;

    };

    GMSandbox.prototype._parselocation = function(geoOption, callback){

        this.geoService.geocode(geoOption, function(results, status){

            if (status == google.maps.GeocoderStatus.OK) {

                var location = results[0].geometry.location;

                callback(location);


            } else {
                throw (
                'Geocode was not successful for the following reason: ' + status
                );
            }

        })

    };

    GMSandbox.prototype._defineLocation = function(userLocation){

        var location = null;
        var type = null;
        if(typeof userLocation === 'object'){
            type = 'location';
            location = {};
            location.lat = userLocation.lat;
            location.lng = userLocation.lng;
        }

        if(typeof  userLocation === 'string'){
            type = 'address';
            location = userLocation;
        }

        return {type: type, location: location};
    };

    GMSandbox.prototype._defineLable = function(userLabel){

        var label = userLabel;

        if(typeof userLabel === 'object'){

            if(userLabel.fontFamily){
                label.fontFamily = userLabel.fontFamily;
            }

            if(userLabel.fontSize){
                label.fontSize = userLabel.fontSize;
            }

            if(userLabel.color){
                label.color = userLabel.color;
            }

            if(userLabel.text){
                label.text = userLabel.text;
            }


        }

        return label;
    };

    GMSandbox.prototype._defineIcon = function(userIcon){

        var icon = userIcon;

        if(typeof userIcon === 'object'){

            icon.url = userIcon.url;

            icon.size = (userIcon.size) ?
                new google.maps.Size(userIcon.size[0], userIcon.size[1]) : undefined;

            icon.origin = (userIcon.origin) ?
                new google.maps.Size(userIcon.origin[0], userIcon.origin[1]) : undefined;

            icon.anchor = (userIcon.anchor) ?
                new google.maps.Point(userIcon.anchor[0], userIcon.anchor[1]) : undefined;

            icon.scaleSize = (userIcon.scaleSize) ?
                new google.maps.Size(userIcon.scaleSize[0], userIcon.scaleSize[1]) : undefined;

        }

        return icon;
    };

    GMSandbox.prototype._defineMarkerObj = function (gMarker, name) {


        return {
            name: name,
            position: {
                lat: gMarker.position.lat(),
                lng: gMarker.position.lng()
            },
            marker: gMarker
        }
    };

    /**
     * Add a normal marker on Google Map
     *
     * @param options {Object}
     */
    GMSandbox.prototype.addMarker = function (options) {

        var geoOption = {};
        var markerOption = {};

        var _location = this._defineLocation(options.location);

        geoOption[_location.type] = _location.location;

        markerOption.label = this._defineLable(options.label);

        markerOption.icon = this._defineIcon(options.icon);

        markerOption.map = this.instance;

        this._parselocation(geoOption, function(location){

            markerOption.position = location;

            this.instance.setCenter(location);

            this.instance.setZoom(this.zoomLevel);

            var marker = new google.maps.Marker(markerOption);

            var markerName =
                (options.name) ? options.name : 'marker_'+this.markers.length;

            this.markers.push(this._defineMarkerObj(marker, markerName));

        }.bind(this));


    };

    /**
     * Add a customized marker on Google Map
     *
     * @param options {Object}
     */
    GMSandbox.prototype.addCustomMarker = function(options){

        var template = options.template || '';
        var anchor = options.anchor;
        var draggable = options.draggable;

        var geoOption = {};

        var _location = this._defineLocation(options.location);

        geoOption[_location.type] = _location.location;

        this._parselocation(geoOption, function(location){

            this.instance.setCenter(location);

            this.instance.setZoom(this.zoomLevel);

            var customizedMarker =
                new this.CustomizedMarker(template, location, this, anchor, draggable);

            var markerName =
                (options.name) ? options.name : 'custom_marker_'+this.markers.length;


            this.markers.push(this._defineMarkerObj(customizedMarker, markerName));

        }.bind(this));


    };



    /**
     * find a marker on map by its name
     *
     * @param markerName {String}
     * @returns {GMSandbox.CustomizedMarker|google.maps.Marker}
     */
    GMSandbox.prototype.findMarker = function(markerName){

        var tempMarkers = this.markers.map(function(v){return v.name});

        var markerIndex = tempMarkers.indexOf(markerName);

        return this.markers[markerIndex];
    };



    /**
     * Remove a marker on map
     *
     * @param marker {String|GMSandbox.CustomizedMarker|google.maps.Marker}
     */
    GMSandbox.prototype.removeMarker = function(marker){

        var markerName = '';

        if(typeof marker === 'string'){
            markerName = marker;
        }

        if(marker.marker instanceof GMSandbox.CustomizedMarker
            || marker.marker instanceof google.maps.Marker){
            markerName = marker.name;
        }

        var tempMarkers = this.markers.map(function(v){return v.name});

        var markerIndex = tempMarkers.indexOf(markerName);

        if(markerIndex !== -1){
            this.markers[markerIndex].marker.setMap(null);
            this.markers.splice(markerIndex, 1);
        }

    };



    /**
     * Set map center to a specific marker
     *
     * @param marker {String|GMSandbox.CustomizedMarker|google.maps.Marker}
     * @returns {GMSandbox.CustomizedMarker|google.maps.Marker}
     */
    GMSandbox.prototype.focusMarker = function(marker){

        var markerObj = null;

        if(typeof marker === 'string'){
            markerObj = this.findMarker(marker);

        }

        if(marker.marker instanceof GMSandbox.CustomizedMarker
            || marker.marker instanceof google.maps.Marker){
            markerObj = marker;
        }

        try{
            if(markerObj){
                this.instance.panTo(markerObj.position);
                this.instance.setZoom(this.zoomLevel);
            }

            return markerObj;
        }catch(ex){
            throw "Can't Find Marker In Current Map..."
        }


    };



    /**
     * Get current Google map object
     *
     * @returns {google.maps.Map}
     */
    GMSandbox.prototype.getMap = function(){

        return this.instance;

    };



    /**
     * Change map type
     *
     * @param mapType {String}
     */
    GMSandbox.prototype.setMapType = function(mapType){

        var mapTypeId = mapType.toUpperCase();

        if(mapTypeId === 'ROADMAP' || mapTypeId === 'SATELLITE'
        || mapTypeId === 'TERRAIN' || mapTypeId === 'HYBRID'){
            this.instance.setMapTypeId(google.maps.MapTypeId[mapTypeId]);
        }


    };


    /**
     * Bind an event handler to a specific map event
     *
     * @param eventName {String}
     * @param callback {Function}
     */
    GMSandbox.prototype.on  = function(eventName, callback){

        if(typeof eventName === 'string' && typeof callback === 'function'){
            google.maps.event.addListener(this.instance, eventName, function(event){

                callback(event, this.instance, this.markers);

            }.bind(this));
        }


    };


    /**
     * Make it support AMD and CommonJs coding style
     */
    if(global.define){
        global.defind('GMSandbox', [], function(){
            return GMSandbox;
        })
    }else{
        if(global.exports){
            global.exports.GMSandbox = GMSandbox;
        }else{
            global.GMSandbox = global.GMSandbox || GMSandbox;
        }
    }



})(window);