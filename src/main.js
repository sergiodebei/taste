$( document ).ready(function() {

    AOS.init();
    
    //to remove for deploy
    var gtmDataObject = [];

    document.addEventListener("touchstart", function(){}, true);

    $('#thechoice').parallax({
        imageSrc: 'https://s3.eu-central-1.amazonaws.com/dev-nes-b2c-974-prospectpage/img/thechoice_background_parallax_alt.jpg',
        speed: 0.5
    });
    

    $(document).click(function (e) {
        if (!$(e.target).hasClass(".popup-inner") && $(e.target).parents(".popup-inner").length === 0) {
            $(".popup").hide();
        }
    });

    function close_accordion_section() {
        $('.yourfavourite_title').removeClass('active').parent().removeClass('active');
        $('.themagic').slideUp(300).removeClass('open');
    }

    //accordion
    if($('#thechoice').length){
        setTimeout(function (){
            $('.yourfavourite_title').click(function(e) {
                 if ($(window).width() < 660) {
                    // Grab current anchor value
                    var currentAttrValue = $(this).attr('href');
                    // console.log(currentAttrValue);
                    if($(e.target).is('.active')) {
                        close_accordion_section();
                    }else {
                        close_accordion_section();
                        // Add active class to section title
                        $(this).addClass('active').parent().addClass('active');
                        // Open up the hidden content panel
                        $(currentAttrValue).slideDown(300).addClass('open'); 
                    }
                }
                e.preventDefault();
            });
        }, 20);
    }
});

function checkit(){
    if ($(window).width() < 660) {

        $( "#thechoice").children().removeClass('active');

        $( "#thechoice .row .col-m-4:first-child")
            .children('.yourfavourite').addClass('active')
            .children('.yourfavourite_title').addClass('active')
            .next( ".themagic" ).slideDown(300).addClass('open');
    }
    else {
        $( ".themagic").slideDown(300);
    }
}

function animateArrowPosition(){
    var offset_new = ($('.thumb-active').offset().left - $('.tabsthumbs').offset().left + $('.thumb-active').outerWidth() / 2 - 10);
    var newcolor = $('.tab-active').css( "border-top-color" );
    // console.log(offset_new);
    // console.log(newcolor);

    var style = document.createElement("style");
    document.head.appendChild(style);
    style.sheet.insertRule(".tabsthumbs:before{ left:" + offset_new + "px; border-bottom: 10px solid " + newcolor + "}", 0);
    // document.styleSheets[0].addRule('.tabsdepartment:before','left: ' + newoffset + 'px');
    // document.styleSheets[0].addRule('.tabsdepartment:before','border-bottom: 10px solid ' + newcolor);
};

$(window).on('load resize', function () {
    checkit();
});



angular
    .module('App', ['ngSanitize'])
    .controller('Ctrl', Init)
    .filter('capitalize', function() {
        return function(input) {
          return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
        }
    })
    .config(function ($locationProvider){
        $locationProvider.html5Mode(true);
    })
    .$inject = ['$http', '$location', '$q', '$window', '$sce','$timeout'];

function Init($http, $location, $q, $window, $sce,$timeout) {
    var vm = this;
    vm.packagesTabA = '';
    
    /////////////////////////////
    // all google things go here
    /////////////////////////////

    function get_list(eventname, list){

        var list = list || vm.packagesTabA;

        console.log('get_list ', list, eventname);

        //GOOGLE IMPRESSION TRACKER TAB A
        // Measures product impressions and also tracks a standard
        // pageview for the tag configuration.
        // Product impressions are sent by pushing an impressions object
        // containing one or more impressionFieldObjects.
            for(var i=0; i< list.length; i++){
                // console.log(list[i].sku , i, list[i])

                impressionsProducts(list[i]);

            }
            return list;
    }

    var gtmDataObject = []; 

    var is_tab_visible = false;

    function isElementOutViewport(el) {
        //use [0] since jquery doenst have getBoundingClientRect method.
        var rect = el[0].getBoundingClientRect();
        return rect.bottom < 0 || rect.right < 0 || rect.left > window.innerWidth || rect.top > window.innerHeight;
    }

    function onScrollHandler() {
        if (!is_tab_visible) {
            var isInViewPortVar = !isElementOutViewport($('.tabs'));
            // console.log(isInViewPortVar);
            if (isInViewPortVar) {
                //DISPLAY EVENTS
                // dispatchGoogleEvent('Display', 'Display', 1)
                    //executes only once as the element becomes visible
                is_tab_visible = true;

                var returnlist = get_list('scroll');
                console.log('returnlist',returnlist);

                gtmDataObject.push({
                    'event': 'itemDisplay', // Mandatory as is
                    'eventRaisedBy': 'FreeHTML', // Mandatory as is
                    'eventAction': 'Scroll', // Action that led to the item display
                    'itemTypes': returnlist, // Mandatory: Concerned item type(s)
                    'rootElement': 0 // Root DOM element for item detection
                });
                console.log('onscroll event - when tab products appears');
            }
        }
    }

    function impressionsProducts(settings){
      // Please create an entry for each product on the page,
      // Use the product international SKU for the key of each entry
        impressionsOnScroll[settings.sku] = {
            brand: "Nespresso",
            category: 'capsules', // "capsules", "machines" or "accessories"
            dimension43: 'false', // "true" or "false" (in lower case)
            dimension44: 'false', // "true" or "false" (in lower case)
            dimension53: settings.sku,
            dimension54: settings.name,
            dimension55: 'espresso', // "espresso|intense"
            dimension56: 'Original', // ie: "Original|||Pro|||Vertuo"
            dimension57: 'bundle', // "single" or "bundle"
            id: settings.sku, // International SKU, must be the same as the key
            name: settings.name,
            price: settings.price
        };
    };



    /////////////////////////////
    // all google things finish here
    /////////////////////////////


    //requesting menu data
    var data = [ "data/en/data.json", "data/en/coffee.json"];
    // var data = [ "https://s3.eu-central-1.amazonaws.com/nes-b2c-974-prospectpage/live/data/nl/data.json", "https://s3.eu-central-1.amazonaws.com/nes-b2c-974-prospectpage/live/data/nl/coffee.json"];
    var promises = data.map(function (datum) {
        return $http.get(datum);
    })

    var taskCompletion = $q.all(promises);

    taskCompletion.then(function (responses) {



        //page copy response
        vm.copy = responses[0].data;

        vm.packages = responses[1].data.coffee.category.packages;
        // console.log(vm.packages )

        vm.packagesTabA = collectData(vm.copy.thetabs.tab[0].packages, vm.packages);
//         console.log('vm.packagesTabA : ', vm.packagesTabA)

        vm.packagesTabB = collectData(vm.copy.thetabs.tab[1].packages, vm.packages);
        // console.log('vm.packagesTabB : ', vm.packagesTabB)

        vm.table = responses[0].data.thechoice.table;
        // console.log('vm.table : ', vm.table);
        vm.table_re = responses[0].data.thechoice_re.table;

        vm.combination = responses[0].data.combination;
        // console.log('vm.combination : ', vm.combination);

        vm.capsules = responses[1].data.coffee.category.classic;

        $(window).on('scroll', onScrollHandler);
        onScrollHandler();
        
        vm.tabClick = function(int){
            var list = '';
            if(int == 1){
                list = vm.packagesTabA;
                //google event - item display welcome package
                gtmDataObject.push({
                    'event': 'itemDisplay', // Mandatory as is
                    'eventRaisedBy': 'FreeHTML', // Mandatory as is
                    'eventAction': 'Click', // Action that led to the item display
                    'itemTypes': list, // Mandatory: Concerned item type(s)
                    'rootElement': 0 // Root DOM element for item detection
                });

                  // CUSTOM GOOGLE EVENT - User clicks on 150 pack tab
                  var eString = 'Welcome Pack - Tab select - 150 packs';
                  gtmDataObject.push({
                      'event': 'customEvent',
                      'eventCategory': 'User Engagement',
                      'eventAction': 'Click',
                      'eventLabel': eString,
                      'nonInteraction Setting - Default FALSE': 0
                  });

            }else if(int == 2){
                list = vm.packagesTabB;
                //google event - item display welcome package
                gtmDataObject.push({
                    'event': 'itemDisplay', // Mandatory as is
                    'eventRaisedBy': 'FreeHTML', // Mandatory as is
                    'eventAction': 'Click', // Action that led to the item display
                    'itemTypes': list, // Mandatory: Concerned item type(s)
                    'rootElement': 0 // Root DOM element for item detection
                });

                // CUSTOM GOOGLE EVENT - User clicks on 250 pack tab
                var eString = 'Welcome Pack - Tab select - 250 packs';
                gtmDataObject.push({
                    'event': 'customEvent',
                    'eventCategory': 'User Engagement',
                    'eventAction': 'Click',
                    'eventLabel': eString,
                    'nonInteraction Setting - Default FALSE': 0
                });
            }
            
            get_list('click', list);

        }
        
        //EXECUTE TAB ONE CLICK by default
         vm.tabClick(1);        
        
        $timeout(function (){
            //PACKAGE ADD TO CART
            $('.pp_page_wrapper .add-to-cart').on('click', function(e)  {                
//                console.log($(this).attr("data-product-id") )
                // Measure adding a product to a shopping cart by using an 'add' actionFieldObject
                // and a list of productFieldObjects.
                var _product_name = $(this).attr("data-product-name") 
                var _product_id = $(this).attr("data-product-id") 
                var _product_price = $(this).attr("data-product-price") 
                var _product_qnt = $(this).attr("data-product-qnt") 
                gtmDataObject.push({
                  'event': 'addToCart',
                  'ecommerce': {
                    'currencyCode': 'EUR',
                    'add': {                                // 'add' actionFieldObject measures.
                      'products': [{                        //  adding a product to a shopping cart.
                        'name': _product_name,
                        'id': _product_id,
                        'price': _product_price,
                        'quantity': 1
                       }]
                    }
                  }
                });
               console.log('onloadsettimeout' ,_product_name, ' ', _product_id , ' ', _product_price, ' ', _product_qnt)
                //e.preventDefault();
            });
        }, 30);




    });
    
    vm.cardClick = function(eventString){
        //CUSTOM GOOGLE EVENT - Info select [sku]
        var eString = 'Welcome Pack - Button click - ' + eventString;
        gtmDataObject.push({
            'event': 'customEvent',
            'eventCategory': 'User Engagement',
            'eventAction': 'Click',
            'eventLabel': eString,
            'nonInteraction Setting - Default FALSE': 0
        });
        console.log(eString)
    }


    vm.openPopUp = function(type, obj, e){
//        console.log(type, obj, e.target);
        obj["type"] = type;
        vm.popUpObject = obj;
        // console.log(obj.content === undefined);

        if(obj.content != undefined){
            vm.capsuleInThePackage = parseCapsuleFromPackage(obj.content);
            // console.log('vm.capsuleInThePackage: ',   vm.capsuleInThePackage);
        }
        else{
            vm.capsuleInThePackage = '';
        }

        switch (type){
            case 'cube':
            break;
            case 'package':
                //CUSTOM GOOGLE EVENT - Info select [sku]
                var eString = 'Welcome Pack - Info select - ' + obj.sku;
                gtmDataObject.push({
                    'event': 'customEvent',
                    'eventCategory': 'User Engagement',
                    'eventAction': 'Click',
                    'eventLabel': eString,
                    'nonInteraction Setting - Default FALSE': 0
                });
                console.log(eString)

            break;

            case 'capsule':
                //CUSTOM GOOGLE EVENT - Info select [sku]
                var eString = 'Welcome Pack - Info select - ' + obj.sku;
                gtmDataObject.push({
                    'event': 'customEvent',
                    'eventCategory': 'User Engagement',
                    'eventAction': 'Click',
                    'eventLabel': eString,
                    'nonInteraction Setting - Default FALSE': 0
                });
                console.log(eString)

            break;

            case 'aromaprofiel':
            break;

            default:
        }

        $timeout(function (){
            
               $('.popup').fadeIn(350);
                e.preventDefault();
            

            //----- CLOSE
            $('[data-popup-close]').on('click', function(e)  {
                $('.popup').fadeOut(350);
                //e.preventDefault();
            });
        }, 30);

    }

    vm.selected = {};
    vm.ready  = false;
    vm.tick_intensiteit  = false;
    vm.tick_kopgrootte  = false;
    vm.tick_aromaprofiel  = false;
    var topopulate = new Array(3);
    vm.capsuleToShow = '';
    vm.capsuleInThePackage = '';
    // vm.maxItensity = new Array(12);

    //////////////////////////////
    vm.newValue = function(selected){
        // console.log(Object.values(selected));
        // console.log(Object.keys(selected));
        // console.log('length', Object.keys(selected).length);

        for (var key in selected) {
            // console.log(value);
            if(key == 'intensiteit'){
                topopulate[0] = selected[key];
                vm.tick_intensiteit  = true;
            }
            if(key == 'kopgrootte'){
                topopulate[1] = selected[key];
                vm.tick_kopgrootte  = true;
            }
            if(key == 'aromaprofiel'){
                topopulate[2] = selected[key];
                vm.tick_aromaprofiel  = true;
            }
        }
        // console.log(topopulate);

        for(var i=0; i< vm.combination.length; i++){
            // console.log(vm.combination[i].sequence);
            // console.log(topopulate == vm.combination[i].sequence);
            if(arraysIdentical(topopulate,vm.combination[i].sequence)){
                vm.ready = true;
                vm.capsuleToShow = vm.combination[i].cap_to_show;


            }
        }
        // console.log(vm.capsuleToShow, vm.capsules );
        vm.capsulesCollection = collectData(vm.capsuleToShow , vm.capsules);
        // console.log(vm.capsulesCollection);

        if(vm.ready)
            $timeout(animateArrowPosition, 20);
    }

    var appWindow = angular.element($window);
    appWindow.bind('resize', function () {
        if ($window.innerWidth < 660 && vm.ready) {
            $timeout(animateArrowPosition, 20);
        }
    });

    //////////////////////////////
    vm.resultClick = function(e){

        var clicked = e.target;

        $('.thumb').not(clicked).removeClass('thumb-active');
        $(clicked).toggleClass('thumb-active');
        var offset = $(clicked).offset();
        // console.log(offset.left);
        var id = $(clicked).attr("data-id");
        $('.tabsthumbs_single').removeClass('tab-active');
        $('.tabsthumbs_single[data-tab-id="'+ id + '"]').toggleClass('tab-active');

        var halfimage = $(clicked).outerWidth() / 2;
        var offset_new = offset.left - $('.tabsthumbs').offset().left + halfimage - 10;
        var color = $('.tabsthumbs_single[data-tab-id="'+ id + '"]').css( "border-color" );
        // console.log(offset);
        // console.log(color);

        var style = document.createElement("style");
        document.head.appendChild(style);
        style.sheet.insertRule(".tabsthumbs:before{ left:" + offset_new + "px; border-bottom: 10px solid " + color + "}", 0);
        // // document.styleSheets[0].addRule('.tabsdepartment:before','left: ' + offset + 'px');
        // // document.styleSheets[0].addRule('.tabsdepartment:before','border-bottom: 10px solid ' + color);
        // // document.styleSheets[0].addRule('.tab[data-tab-id="'+ id + '"]:before','left: ' + offset.left + 'px');
        // // $('.tab[data-tab-id="'+ id + '"]:before').css("left", "15px");

    }

    //////////////////////////////
    function parseCapsuleFromPackage(list){
        var arr = new Array();
        for (var j = 0; j< list.length; j++){
            for (var i = 0; i < vm.capsules.length; i++){
                if(vm.capsules[i].sku == list[j].id && vm.capsules[i].inStock === true){
                    // console.log(list[j].amount);
                    var newObj =  {
                        item:vm.capsules[i],
                        quantity:list[j].amount
                    }
                    arr.push(newObj);
                }
            }
        }
        return arr;
    }

    //////////////////////////////
    function arraysIdentical(a, b) {
        var i = a.length;
        if (i != b.length) return false;
        while (i--) {
            if (a[i] !== b[i]) return false;
        }
        return true;
    };

    //////////////////////////////
    function collectData(list, category){

        var arr = new Array();
        for (var j = 0; j< list.length; j++){
            for (var i = 0; i < category.length; i++){
                if(category[i].sku == list[j] && category[i].inStock === true){
                    arr.push(category[i]);
                }
            }
        }
        return arr;
    };

    ////////////////////////////// manage the new selection
    vm.selected_filter = '';
    vm.ready_re  = false;
    vm.selected_filter_result = '';
    vm.dynamic_class = '';
    // vm.filter_intensiteit  = false;
    // vm.filter_kopgrootte  = false;
    // vm.filter_aromaprofiel  = false;

    vm.setActive = function(selected_filter) {
//         console.log('selected_filter: ', selected_filter);
        vm.activeItem = selected_filter;
        vm.dynamic_class = 'dc_' + selected_filter;
        vm.selected_filter_result = new Array();
        vm.ready_re  = true;

        for (var i = 0; i < vm.table_re.length; i++){
            if(vm.table_re[i].id === selected_filter){
                // console.log( vm.table_re[i].cap_to_show);

                var eString = ' Welcome Pack - Aromatic profile select - ' + vm.table_re[i].header ;                
                for (var j = 0; j < vm.table_re[i].cap_to_show.length; j++){
                    // console.log(vm.table_re[i].cap_to_show[j].sequence);
                    var capsulesCollection_temp = collectData(vm.table_re[i].cap_to_show[j].sequence , vm.capsules);
                    // console.log(capsulesCollection_temp);
                    vm.selected_filter_result.push({
                        slug: vm.table_re[i].cap_to_show[j].slug, 
                        icon: vm.table_re[i].cap_to_show[j].icon_url,
                        amount: vm.table_re[i].cap_to_show[j].amount,
                        sequence:  capsulesCollection_temp
                    });
                }
            }
        }
        setTimeout(function (){
            $('html, body').animate({
                    scrollTop: $("#thechoice_re").offset().top - 45
                }, 500);
            
            
                        //PACKAGE ADD TO CART
            $('.pp_page_wrapper .add-to-cart').on('click', function(e)  {                
//                console.log($(this).attr("data-product-id") )
                // Measure adding a product to a shopping cart by using an 'add' actionFieldObject
                // and a list of productFieldObjects.
                var _product_name = $(this).attr("data-product-name") 
                var _product_id = $(this).attr("data-product-id") 
                var _product_price = $(this).attr("data-product-price") 
                
                gtmDataObject.push({
                  'event': 'addToCart',
                  'ecommerce': {
                    'currencyCode': 'EUR',
                    'add': {                                // 'add' actionFieldObject measures.
                      'products': [{                        //  adding a product to a shopping cart.
                        'name': _product_name,
                        'id': _product_id,
                        'price': _product_price
                       }]
                    }
                  }
                });
                console.log('onsetActive', _product_name, ' ', _product_id , ' ', _product_price, ' ')
                //e.preventDefault();
            });
        
            
            
            
            
            
            
            
            
        }, 20);
        // console.log(vm.selected_filter_result);

         //CUSTOM GOOGLE EVENT - Welcome Pack - Aromatic profile select - [profle]       
        gtmDataObject.push({
            'event': 'customEvent',
            'eventCategory': 'User Engagement',
            'eventAction': 'Click',
            'eventLabel': eString,
            'nonInteraction Setting - Default FALSE': 0 
        });
        
        console.log(eString)
        
        
        
    }

    // function setIntensity(intensity){
    //     var maxItensity = 10;
    //     for (var i = 0; i < maxItensity; i++){
    //         if(howmanydots < i ){

    //         }else{

    //         }
    //     }
    // }

}
