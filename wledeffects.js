var uniqueSystemIps={};
var uniqueModels=[];
var wledEffectsConfig = {}

function SaveWledEffectsConfig() {
    var data = JSON.stringify(wledEffectsConfig);
    $.ajax({
        type: "POST",
        url: 'api/configfile/plugin.fpp-WledEffects.json',
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
    if(wledEffectsConfig.multisync==true){
        $.each(wledEffectsConfig.systems,(i,v)=>{
            uniqueSystemModelRequests.push(
                $.ajax({
                    type: "GET",
                    url: 'plugin.php?plugin=fpp-WledEffects&page=remotemodels.php&nopage=1&ip='+v,
                    dataType: 'json',
                    success: function (data) {
                        if("error" in data){
                            console.warn("Could not access model API for "+v);
                        }else{
                            $.each(data,function(j,w){
                            
                                if($.inArray(w.Name,uniqueModels)===-1){
                                    uniqueModels.push(w.Name);
                                }
                            })
                        }
                    }
                })
            )     
        });
    }else{
        uniqueSystemModelRequests.push(
            $.ajax({
                type: "GET",
                url: 'api/models',
                dataType: 'json',
                success: function (data) {
                    $.each(data,function(j,w){
                    
                        if($.inArray(w.Name,uniqueModels)===-1){
                            uniqueModels.push(w.Name);
                        }
                    })
                }
            })
        )        
    }

    
    return uniqueSystemModelRequests;
}

function renderModelSelections(){
    $('.fpp-WledEffects-Model-Selections label, .fpp-WledEffects-Model-Selections .spinner').remove();
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
function applyWLEDConfigToSystems(systems) {
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

$(function(){
    $.get('api/overlays/effects').done(function(data) {
        $.each(data, function(i,v) {
            var effectButton=$('<button>' + v + '</button>').click(function() {
                setWledEffect({
                    effect:v
                });
            });
            $('#availableWledEffects').append($('<div class="col-lg-4 col-md-66" />').append(effectButton));
        });
    });
    $.ajax({
        type: "GET",
        url: 'api/fppd/multiSyncSystems',
        dataType: 'json',
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
                url: 'api/configfile/plugin.fpp-WledEffects.json',
                error: function(json) {
                    wledEffectsConfig = {
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
                    applyWLEDConfigToSystems(systems);
                },
                success: function (json) {                 
                    wledEffectsConfig = json;
                    applyWLEDConfigToSystems(systems);
                }
            });

        }
    })

        
  
    $('#fpp-WledEffects-reset').on('click',function(){
        $.ajax({
            url: "plugin.php?plugin=fpp-WledEffects&page=resetpluginsettings.php",
        }).done(function() {
            $.jGrowl("fpp-WledEffects Plugin Settings have been reset",{themeState:'success'});
        });
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
    $.ajax({
        type: "POST",
        url: 'api/command',
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
    $.get("api/overlays/effects/"+options.effect).done(function(data) {
        $("#EffectName").html(options.effect);
        for (var x = 1; x < 25; x++) {
            $('#wledTblCommandEditor_arg_' + x + '_row').remove();
        }
        PrintArgInputs('wledTblCommandEditor', false, data['args'], 1);
        $("#fpp-WledEffects-Buttons").show();
    });
}

function CreateEffectJSON() {
    var json = {};
    json["command"] = "Overlay Model Effect";
    json["multisyncCommand"] = wledEffectsConfig.multisync;
    json["multisyncHosts"] = wledEffectsConfig.systems.join(',');
    json["args"] = [];
    json["args"].push(wledEffectsConfig.models.join(','));
    json["args"].push("Enabled");
    json["args"].push($("#EffectName").html());
    for (var x = 1; x < 20; x++) {
        var inp = $("#wledTblCommandEditor_arg_" + x);
        var val = inp.val();
        if (inp.attr('type') == 'checkbox') {
            if (inp.is(":checked")) {
                json["args"].push("true");
            } else {
                json["args"].push("false");
            }
        } else if (inp.attr('type') == 'number' || inp.attr('type') == 'text') {
            json["args"].push(val);
        } else if (Array.isArray(val)) {
            json["args"].push(val.toString());
        } else if (typeof val != "undefined") {
            json["args"].push(val);
        }
    }
    return json;
}

function RunWledEffect() {
    var json = CreateEffectJSON();
    $.ajax({
        type: "POST",
        url: 'api/command',
        dataType: 'json',
        data: JSON.stringify(json),
        contentType: 'application/json',
        success: function (data) {
        }
    });
}


