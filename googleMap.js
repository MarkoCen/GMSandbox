(function(global){

    'use strict';

    var Sandbox = function(){

        this.instance = null;
        this.mapOptions = null;
        this.element = null;
        this.userInitCallback = null;
        this.geoService = null;
        this.markers = [];

    };

    Sandbox.prototype.initClasses = function(google){



        Sandbox.CustomizedMarker = function(html, position, self){

            var div = document.createElement('div');
            div.style.position = 'absolute';
            div.innerHTML = html;

            var self = self || this;

            this.template = div;

            this.position = position;

            this.setMap(self.instance);

        };

        Sandbox.CustomizedMarker.prototype  = new google.maps.OverlayView();

        Sandbox.CustomizedMarker.prototype.onAdd = function(){

            // Add the element to the "overlayLayer" pane.
            var panes = this.getPanes();
            panes.overlayMouseTarget.appendChild(this.template);

        };

        Sandbox.CustomizedMarker.prototype.draw = function() {


            var overlayProjection = this.getProjection();


            var pixelPosition = overlayProjection.fromLatLngToDivPixel(this.position);

            var div = this.template;

            div.style.left = ( pixelPosition.x - div.offsetWidth / 2 )+ 'px';
            div.style.top = ( pixelPosition.y - div.offsetHeight )+ 'px';

        };
        
        Sandbox.CustomizedMarker.prototype.onRemove = function () {

            this.template.parentNode.removeChild(this.template)
            this.template = null;

        }

    };





    Sandbox.prototype.initCallback = function(){

        if(!global.google){
            throw 'Google Map Javascript API Not Found!';
        }

        this.geoService = new global.google.maps.Geocoder();

        this.instance = new global.google.maps.Map(this.element, this.mapOptions);

        this.initClasses(global.google);

        if(typeof  this.userInitCallback === 'function')
        {
            this.userInitCallback();
        }

    };

    Sandbox.prototype.init = function(elem, apiKey, options, callback){

        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'http://maps.googleapis.com/maps/api/js?v=3&callback=gmSandbox.initCallback&key=' + apiKey;
        document.head.appendChild(script);

        this.mapOptions = options;
        this.userInitCallback = callback;
        this.element = (typeof elem === 'string') ?
            document.getElementById(elem) : elem;

    };

    Sandbox.prototype.addMarker = function (options) {

        var location = options.location;
        var label = options.label;
        var icon = options.icon;

        var geoOption = {};
        var markerOption = {};

        if(typeof location === 'object'){
            geoOption.location = {};
            geoOption.location.lat = location.lat;
            geoOption.location.lng = location.lng;
        }

        if(typeof  location === 'string'){
            geoOption.address = location;
        }

        if(typeof label === 'string'){
            markerOption.label = label
        }

        if(typeof  label === 'object'){

            var paramLabel = label;

            markerOption.label = {};

            if(paramLabel.fontFamily){
                markerOption.label.fontFamily = paramLabel.fontFamily;
            }

            if(paramLabel.fontSize){
                markerOption.label.fontSize = paramLabel.fontSize;
            }

            if(paramLabel.color){
                markerOption.label.color = paramLabel.color;
            }

            if(paramLabel.text){
                markerOption.label.text = paramLabel.text;
            }


        }


        if(typeof icon === 'object'){

            markerOption.icon = {};

            markerOption.icon.url = icon.url;

            markerOption.icon.size = (icon.size) ?
                new google.maps.Size(icon.size[0], icon.size[1]) : undefined;

            markerOption.icon.origin = (icon.origin) ?
                new google.maps.Size(icon.origin[0], icon.origin[1]) : undefined;

            markerOption.icon.anchor = (icon.anchor) ?
                new google.maps.Point(icon.anchor[0], icon.anchor[1]) : undefined;

            markerOption.icon.scaleSize = (icon.scaleSize) ?
                new google.maps.Size(icon.scaleSize[0], icon.scaleSize[1]) : undefined;

        }

        if(typeof icon === 'string'){
            markerOption.icon = icon;
        }

        markerOption.map = this.instance;

        var self = this;

        this.geoService.geocode(geoOption, function(results, status){

            if (status == google.maps.GeocoderStatus.OK) {

                var location = results[0].geometry.location;

                markerOption.position = location;

                self.instance.setCenter(location);

                self.instance.setZoom(13);

                var marker = new google.maps.Marker(markerOption);

                self.markers.push(marker);

            } else {
                throw (
                'Geocode was not successful for the following reason: ' + status
                );
            }

        })


    };

    Sandbox.prototype.addCustomMarker = function(options){

        var template = options.template;
        var location = options.location;

        var geoOption = {};

        if(typeof location === 'object'){
            geoOption.location = {};
            geoOption.location.lat = location.lat;
            geoOption.location.lng = location.lng;
        }

        if(typeof  location === 'string'){
            geoOption.address = location;
        }

        var self = this;

        this.geoService.geocode(geoOption, function(results, status){

            if (status == google.maps.GeocoderStatus.OK) {

                var location = results[0].geometry.location;

                self.instance.setCenter(location);

                self.instance.setZoom(13);

                var customizedMarker = new Sandbox.CustomizedMarker(template, location, self);

                self.markers.push(customizedMarker);

            } else {
                throw (
                    'Geocode was not successful for the following reason: ' + status
                );
            }

        });

        

    };


    global.gmSandbox = global.gmSandbox || new Sandbox();



})(window);