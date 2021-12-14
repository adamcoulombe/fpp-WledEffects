// $.ajax({
//     type: "GET",
//     url: 'fppjson.php?command=getPluginJSON&plugin=fpp-WledEffects',
//     dataType: 'json',
//     contentType: 'application/json',
//     success: function (data) {
//     }
// });

var uniqueSystemIps={};


// $.ajax({
//     type: "GET",
//     url: '/api/fppd/multiSyncSystems',
//     dataType: 'json',
//     contentType: 'application/json',
//     success: function (data) {
//         console.log(data)
//         $.each(data.systems,function(i,v){
//             if(v.uuid!=""){
//                 uniqueSystems[v.uuid]=v;
//             }else{
//                 uniqueSystems[i]=v;
//             }

//         })
//         $.each(uniqueSystems,function(i,v){

//             var nodestat=$('<li/>');
//             nodestat.html(v.address);
//             $('#fpp-WledEffects').append(nodestat);
//             $.ajax({
//                 type: "GET",
//                 url: '/plugin.php?plugin=fpp-WledEffects&page=wledjson.php&action=get_models&ip='+v.address+'&nopage=1',
//                 dataType: 'json',
//                 contentType: 'application/json',
//                 success: function (data) {
//                     console.log(data);
//                 }
//             });
//         })
//     }
// });
function getUniqueSystemIps(uniqueSystems){
    var ips=[];
    Object.keys(uniqueSystems).forEach(function(key, index) {
        ips.push(uniqueSystems[key].address);
    });
    return ips;
}
function getSelectedModels(){
    var selectedModels=[]
    $('.fpp-WledEffects-Model-Selections input[type=checkbox]:is(:checked)').each(function(){
        selectedModels.push($(this).data('model-name'));
    })
    return selectedModels;
}


$(function(){
    $.each(availableWledEffects,function(i,v){
        var effectButton=$('<button>'+v.substring(7)+'</button>').click(function(){
            setWledEffect({
                hosts:uniqueSystemIps,
                models:getSelectedModels(),
                effect:v

            })
        })
        $('#availableWledEffects').append($('<div class="col-4" />').append(effectButton));
    });
    $.ajax({
        type: "GET",
        url: '/api/fppd/multiSyncSystems',
        dataType: 'json',
        contentType: 'application/json',
        success: function (data) {
            uniqueSystems={}
            $.each(data.systems,function(i,v){
                if(v.uuid!=""){
                    uniqueSystems[v.uuid]=v;
                }else{
                    uniqueSystems[i]=v;
                }
            })
            uniqueSystemIps=getUniqueSystemIps(uniqueSystems);
        }
    });
    $.ajax({
        type: "GET",
        url: '/api/models',
        dataType: 'json',
        contentType: 'application/json',
        success: function (data) {
            console.log(data);
            $.each(data,function(i,v){
                $('.fpp-WledEffects-Model-Selections').append(
                    $('<label>'+v.Name+'</label>').prepend(
                        $('<input type="checkbox"/>').data('model-name',v.Name).on('change',function(){
                            if($(this).is(':checked')){
                                $(this).parent().addClass('selected');
                            }else{
                                $(this).parent().removeClass('selected');
                            }
                        })
                    )
                );
            })
            
        }
    });
    $('#submitEffects').on('click',function(){
        setWledEffect({
            hosts:uniqueSystemIps,
            models:["Arches","LeftEntrance"]
        });
    });
    $('#cancelEffects').on('click',function(){
        stopWledEffects({
            hosts:uniqueSystemIps,
            models:getSelectedModels()
        });
    });
    $('.fpp-WledEffects-Model-Grouping-Heading input[type=checkbox]').on('change',function(){
        $(this).parent().parent().next().find('input[type=checkbox]').prop('checked', $(this).is(':checked'));
    })
    $('.fpp-WledEffects-Model-Toggle').click(function(){
        $(this).parent().toggleClass('open')
    })
})

function stopWledEffects(options){
    $.ajax({
        type: "POST",
        url: '/api/command',
        dataType: 'json',
        data: JSON.stringify({
            "command":"Overlay Model Effect",
            "multisyncCommand":true,
            "multisyncHosts":options.hosts.join(','),
            "args": [
                options.models.join(','),
                "Enabled",
                "Stop Effects"
            ]
        }),
        contentType: 'application/json',
        success: function (data) {
            console.log(data);
        }
    });
}
function setWledEffect(options){
    $.ajax({
        type: "POST",
        url: '/api/command',
        dataType: 'json',
        data: JSON.stringify({
            "command":"Overlay Model Effect",
            "multisyncCommand":true,
            "multisyncHosts":options.hosts.join(','),
            "args": [
                options.models.join(','),
                "Enabled", //Auto Enable/Disable
                options.effect,
                "Horizontal", //Buffer Mapping
                "128", //brightness
                "128", //speed
                "128", //intensity
                "Default",  //pallette
                "#ff0000",
                "#0000ff",
                "#000000"
            ]
        }),
        contentType: 'application/json',
        success: function (data) {
            console.log(data);
        }
    });
}

function SaveConfig(config) {
    var data = JSON.stringify(config);
    $.ajax({
        type: "POST",
        url: 'fppjson.php?command=setPluginJSON&plugin=fpp-WledEffects',
        dataType: 'json',
        async: false,
        data: data,
        processData: false,
        contentType: 'application/json',
        success: function (data) {

        }
    });
}

var availableWledEffects=["WLED - Breathe",
"WLED - Wipe",
"WLED - Wipe Random",
"WLED - Random Colors",
"WLED - Sweep",
"WLED - Dynamic",
"WLED - Colorloop",
"WLED - Rainbow",
"WLED - Scan",
"WLED - Scan Dual",
"WLED - Fade",
"WLED - Theater",
"WLED - Theater Rainbow",
"WLED - Running",
"WLED - Saw",
"WLED - Twinkle",
"WLED - Dissolve",
"WLED - Dissolve Rnd",
"WLED - Sparkle",
"WLED - Sparkle Dark",
"WLED - Sparkle Plus",
"WLED - Strobe",
"WLED - Strobe Rainbow",
"WLED - Strobe Mega",
"WLED - Blink Rainbow",
"WLED - Android",
"WLED - Chase",
"WLED - Chase Random",
"WLED - Chase Rainbow",
"WLED - Chase Flash",
"WLED - Chase Flash Rnd",
"WLED - Rainbow Runner",
"WLED - Colorful",
"WLED - Traffic Light",
"WLED - Sweep Random",
"WLED - Running 2",
"WLED - Aurora",
"WLED - Stream",
"WLED - Scanner",
"WLED - Lighthouse",
"WLED - Fireworks",
"WLED - Rain",
"WLED - Merry Christmas",
"WLED - Fire Flicker",
"WLED - Gradient",
"WLED - Loading",
"WLED - Police",
"WLED - Police All",
"WLED - Two Dots",
"WLED - Two Areas",
"WLED - Circus",
"WLED - Halloween",
"WLED - Tri Chase",
"WLED - Tri Wipe",
"WLED - Tri Fade",
"WLED - Lightning",
"WLED - ICU",
"WLED - Multi Comet",
"WLED - Scanner Dual",
"WLED - Stream 2",
"WLED - Oscillate",
"WLED - Pride 2015",
"WLED - Juggle",
"WLED - Palette",
"WLED - Fire 2012",
"WLED - Colorwaves",
"WLED - Bpm",
"WLED - Fill Noise",
"WLED - Noise 1",
"WLED - Noise 2",
"WLED - Noise 3",
"WLED - Noise 4",
"WLED - Colortwinkles",
"WLED - Lake",
"WLED - Meteor",
"WLED - Meteor Smooth",
"WLED - Railway",
"WLED - Ripple",
"WLED - Twinklefox",
"WLED - Twinklecat",
"WLED - Halloween Eyes",
"WLED - Solid Pattern",
"WLED - Solid Pattern Tri",
"WLED - Spots",
"WLED - Spots Fade",
"WLED - Glitter",
"WLED - Candle",
"WLED - Fireworks Starburst",
"WLED - Fireworks 1D",
"WLED - Bouncing Balls",
"WLED - Sinelon",
"WLED - Sinelon Dual",
"WLED - Sinelon Rainbow",
"WLED - Popcorn",
"WLED - Drip",
"WLED - Plasma",
"WLED - Percent",
"WLED - Ripple Rainbow",
"WLED - Heartbeat",
"WLED - Pacifica",
"WLED - Candle Multi",
"WLED - Solid Glitter",
"WLED - Sunrise",
"WLED - Phased",
"WLED - Twinkleup",
"WLED - Noise Pal",
"WLED - Sine",
"WLED - Phased Noise",
"WLED - Flow",
"WLED - Chunchun",
"WLED - Dancing Shadows",
"WLED - Washing Machine",
"WLED - Candy Cane",
"WLED - Blends",
"WLED - TV Simulator",
"WLED - Dynamic Smooth"]