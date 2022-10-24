var uniqueSystemIps={};
var uniqueModels=[];
var wledEffectsConfig = {}

function SaveWledEffectsConfig() {
    var data = JSON.stringify(wledEffectsConfig);
    // console.log(data)
    $.ajax({
        type: "POST",
        url: 'fppjson.php?command=setPluginJSON&plugin=fpp-WledEffects',
        dataType: 'json',
        data: data,
        processData: false,
        contentType: 'application/json',
        success: function (data) {

        }
    });
}

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

function getSelectedSystems(){
    var selectedSystems=[]
    $('#fpp-WledEffects-systems input[type=checkbox]:is(:checked)').each(function(){
        selectedSystems.push($(this).data('address'));
    })
    return selectedSystems;
}
function getUniqueModels(){
    var uniqueSystemModelRequests = [];
    uniqueModels = [];
    $.each(wledEffectsConfig.systems,(i,v)=>{
        uniqueSystemModelRequests.push(
            $.ajax({
                type: "GET",
                url: 'http://'+v+'/api/models',
                dataType: 'json',
                success: function (data) {
                    $.each(data,function(j,w){
                        
                        if($.inArray(w.Name,uniqueModels)===-1){
                            uniqueModels.push(w.Name);
                            //console.log(uniqueModels)
                        }
                    })
                }
            })
        )
    })
    return uniqueSystemModelRequests;
}

function renderModelSelections(){
    $('.fpp-WledEffects-Model-Selections label').remove();
    $.each(uniqueModels,function(i,v){
        var isChecked = wledEffectsConfig.models.indexOf(v)>-1 ? 'checked':'';
        $('.fpp-WledEffects-Model-Selections').append(
            $('<label>'+v+'</label>').addClass(isChecked?"selected":"").prepend(
                $('<input type="checkbox" '+isChecked+'/>').data('model-name',v).on('change',function(){
                    if($(this).is(':checked')){
                        $(this).parent().addClass('selected');
                    }else{
                        $(this).parent().removeClass('selected');
                    }

                    handleModelChecked();
                    SaveWledEffectsConfig();
                })
            )
        );
    });
}
$(function(){
    $.each(availableWledEffects,function(i,v){
        var effectButton=$('<button>'+v.substring(7)+'</button>').click(function(){
            setWledEffect({
                effect:v

            })
        })
        $('#availableWledEffects').append($('<div class="col-lg-4 col-md-66" />').append(effectButton));
    });
    $.ajax({
        type: "GET",
        url: '/api/fppd/multiSyncSystems',
        dataType: 'json',
        contentType: 'application/json',
        success: function (data) {
            uniqueSystems={}
            var systems = data.systems;
            $.each(systems,function(i,v){
                if(v.uuid!=""){
                    uniqueSystems[v.uuid]=v;
                }else{
                    uniqueSystems[i]=v;
                }          
            })
            uniqueSystemIps=getUniqueSystemIps(uniqueSystems);
            


            $.ajax({
                type: "GET",
                url: 'fppjson.php?command=getPluginJSON&plugin=fpp-WledEffects',
                //url: 'legacyBigButtonsSampleConfig.json',
                dataType: 'json',
                contentType: 'application/json',
                success: function (json) {                 
                    if(!json || json.length<1){
                        wledEffectsConfig={
                            colors:[
                                '#ff0000',
                                '#00ff00',
                                '#0000ff'
                            ],
                            brightness:128,
                            speed:128,
                            intensity:128,
                            bufferMapping:'Horizontal',
                            palette:'Default',
                            multisync:true,
                            models:[],
                            systems:uniqueSystemIps
                        }
                    }else{
                        wledEffectsConfig = JSON.parse(json);
                        wledEffectsConfig.systems = uniqueSystemIps;
                    }
                    uniqueModels = [];
                    
                    $.when.apply(undefined, getUniqueModels()).then(()=>{                  
                            
                        renderModelSelections(uniqueModels)

                        
                        $.each(systems,function(i,v){
                            var isChecked = wledEffectsConfig.systems.indexOf(v.address)>-1 ? 'checked':'';
                            $('#fpp-WledEffects-systems').append(
                                $('<label>'+v.hostname+' ('+v.address+')</label>').addClass(isChecked?"selected":"").prepend(
                                    $('<input type="checkbox" '+isChecked+'/>').data('address',v.address).on('change',function(){
                                        if($(this).is(':checked')){
                                            $(this).parent().addClass('selected');
                                        }else{
                                            $(this).parent().removeClass('selected');
                                        }
                  
                                        handleSystemChecked();
                                        $.when.apply(undefined, getUniqueModels()).then(()=>{                  
                                            renderModelSelections(uniqueModels);
                                            SaveWledEffectsConfig();
                                        });  
                                    })
                                )
                            );
                    
                        });
                        handleModelChecked();
                        handleSystemChecked();
                        $('#fpp-WledEffects-MultisyncEnabled').prop('checked',wledEffectsConfig.multisync).on('change',function(){
                            wledEffectsConfig.multisync = $(this).is(':checked');
                            handleMultisyncChecked();
                            $.when.apply(undefined, getUniqueModels()).then(()=>{                  
                                renderModelSelections(uniqueModels);
                                SaveWledEffectsConfig();
                            });  
                            
                        })
                            
                    });
                    
                    $('#fpp-WledEffects-Colors button').each(function(i,v){
                        var wledColorId = $(this).data('wled-color-id');
                        $(this).colpick({
                            colorScheme:'flat',
                            layout:'rgbhex',
                            color:wledEffectsConfig.colors[i],
                            onSubmit:function(hsb,newHex,rgb,el) {
                                setWledColor(wledColorId,newHex);
                            }
                        }).css({backgroundColor:wledEffectsConfig.colors[i]});
                    });
                    $('#fpp-WledEffects-brightness').val(wledEffectsConfig.brightness).on('change',function(){
                        wledEffectsConfig.brightness=$(this).val();
                        SaveWledEffectsConfig();
                    });
                    $('#fpp-WledEffects-speed').val(wledEffectsConfig.speed).on('change',function(){
                        wledEffectsConfig.speed=$(this).val();
                        SaveWledEffectsConfig();
                    });
                    $('#fpp-WledEffects-intensity').val(wledEffectsConfig.intensity).on('change',function(){
                        wledEffectsConfig.intensity=$(this).val();
                        SaveWledEffectsConfig();
                    });
                }
            });

        }
    })

        
  

    $('#cancelEffects').on('click',function(){
        stopWledEffects();
    });
    $('.fpp-WledEffects-Model-Grouping-Heading input[type=checkbox]').on('change',function(){
        $(this).parent().parent().next().find('input[type=checkbox]').prop('checked', $(this).is(':checked'));
        if($(this).is(':checked')){
            $(this).parent().parent().next().find('input[type=checkbox]').parent().addClass("selected")
        }else{
            $(this).parent().parent().next().find('input[type=checkbox]').parent().removeClass("selected")
        }
        wledEffectsConfig.models = getSelectedModels();
        SaveWledEffectsConfig();
    });
    
    $('.fpp-WledEffects-Model-Toggle').click(function(){
        $(this).parent().toggleClass('open')
    })

})
function handleModelChecked(){
    var allChecked = true;
    $('.fpp-WledEffects-Model-Selections input[type=checkbox]').each(function(){
        if(!$(this).is(':checked')){
            allChecked=false
        }
    })
    $('.fpp-WledEffects-Model-Grouping-Heading input[type=checkbox]').prop('checked', allChecked);
    wledEffectsConfig.models = getSelectedModels();
    
}
function handleSystemChecked(){
    wledEffectsConfig.systems = getSelectedSystems();
    
}
function handleMultisyncChecked(){
    $('#fpp-WledEffects-systems input[type=checkbox]').each(function(){
        if(uniqueSystemIps.indexOf($(this).data('address'))>-1){          
            $(this).prop('checked', $('#fpp-WledEffects-MultisyncEnabled').is(':checked'));
            if($('#fpp-WledEffects-MultisyncEnabled').is(':checked')){
                $(this).parent().addClass('selected');
            }else{
                $(this).parent().removeClass('selected');
            }
        }
    });
    handleSystemChecked();

}
function setWledColor(wledColorId,newHex){

        $('[data-wled-color-id='+wledColorId+']').css({backgroundColor:'#'+newHex}).data('color','#'+newHex).colpickHide();
        wledEffectsConfig["colors"][wledColorId-1]='#'+newHex;
        SaveWledEffectsConfig();
}
function stopWledEffects(options){
    // console.log(wledEffectsConfig)
    $.ajax({
        type: "POST",
        url: '/api/command',
        dataType: 'json',
        data: JSON.stringify({
            "command":"Overlay Model Effect",
            "multisyncCommand":wledEffectsConfig.multisync,
            "multisyncHosts":wledEffectsConfig.systems.join(','),
            "args": [
                wledEffectsConfig.models.join(','),
                "Enabled",
                "Stop Effects"
            ]
        }),
        contentType: 'application/json',
        success: function (data) {
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
            "multisyncCommand":wledEffectsConfig.multisync,
            "multisyncHosts":wledEffectsConfig.systems.join(','),
            "args": [
                wledEffectsConfig.models.join(','),
                "Enabled", //Auto Enable/Disable
                options.effect,
                wledEffectsConfig.bufferMapping, //Buffer Mapping
                wledEffectsConfig.brightness, //brightness
                wledEffectsConfig.speed, //speed
                wledEffectsConfig.intensity, //intensity
                wledEffectsConfig.palette,  //pallette
                wledEffectsConfig.colors[0],
                wledEffectsConfig.colors[1],
                wledEffectsConfig.colors[2]
            ]
        }),
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