var uniqueSystemIps = {};
var uniqueModels = [];
var wledEffectsConfig = {};

function SaveWledEffectsConfig() {
    var data = JSON.stringify(wledEffectsConfig);
    $.ajax({
        type: "POST",
        url: 'api/configfile/plugin.fpp-WledEffects.json',
        dataType: 'json',
        data: data,
        processData: false,
        contentType: 'application/json',
        success: function () {}
    });
}

function getUniqueSystemIps(uniqueSystems) {
    var ips = [];
    Object.keys(uniqueSystems).forEach(function(key) {
        ips.push(uniqueSystems[key].address);
    });
    return ips;
}

function getSelectedModels() {
    var selectedModels = [];
    $('.fpp-WledEffects-Model-Selections input[type=checkbox]:checked').each(function() {
        selectedModels.push($(this).data('model-name'));
    });
    return selectedModels;
}

function getSelectedSystems() {
    var selectedSystems = [];
    $('#fpp-WledEffects-systems input[type=checkbox]:checked').each(function() {
        selectedSystems.push($(this).data('address'));
    });
    return selectedSystems;
}

function getUniqueModels() {
    var uniqueSystemModelRequests = [];
    uniqueModels = [];
    if (wledEffectsConfig.multisync === true) {
        $.each(wledEffectsConfig.systems || [], (i, v) => {
            uniqueSystemModelRequests.push(
                $.ajax({
                    type: "GET",
                    url: 'plugin.php?plugin=fpp-WledEffects&page=remotemodels.php&nopage=1&ip=' + v,
                    dataType: 'json',
                    success: function (data) {
                        if ("error" in data) {
                            console.warn("Could not access remote model API for " + v);
                        } else {
                            processModelsData(data);
                        }
                    }
                })
            );
        });
    } else {
        uniqueSystemModelRequests.push(
            $.ajax({
                type: "GET",
                url: 'api/overlays/models',
                cache: false,
                dataType: 'json',
                success: function (data) {
                    processModelsData(data);
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.error("Model fetch failed:", textStatus, errorThrown);
                }
            })
        );
    }
    return uniqueSystemModelRequests;
}

function processModelsData(data) {
    let modelsArray = Array.isArray(data) ? data : (data.models || data.overlays || data || []);
    $.each(modelsArray, function(j, w) {
        let name = w.Name || w.name || w.ModelName || '';
        if (name && uniqueModels.indexOf(name) === -1) {
            uniqueModels.push(name);
        }
    });
    uniqueModels.sort();
}

function renderModelSelections() {
    $('.fpp-WledEffects-Model-Selections .spinner, .fpp-WledEffects-Model-Selections p.error, .fpp-WledEffects-Model-Selections label').remove();

    if (uniqueModels.length === 0) {
        $('.fpp-WledEffects-Model-Selections').append('<p class="error" style="color:red;">No models found</p>');
        return;
    }

    wledEffectsConfig.models = Array.isArray(wledEffectsConfig.models) ? wledEffectsConfig.models : [];

    $.each(uniqueModels, function(i, v) {
        var isChecked = wledEffectsConfig.models.indexOf(v) > -1 ? 'checked' : '';
        var $label = $('<label>' + v + '</label>').addClass(isChecked ? "selected" : "").prepend(
            $('<input type="checkbox" ' + isChecked + '/>').data('model-name', v).on('change', function() {
                if ($(this).is(':checked')) {
                    $(this).parent().addClass('selected');
                } else {
                    $(this).parent().removeClass('selected');
                }
                handleModelChecked();
                SaveWledEffectsConfig();
            })
        );

        $('.fpp-WledEffects-Model-Selections').append($label);
    });
}

function applyWLEDConfigToSystems(systems) {
    $.when.apply(undefined, getUniqueModels()).then(() => {
        renderModelSelections();
        $.each(systems, function(i, v) {
            var isChecked = wledEffectsConfig.systems.indexOf(v.address) > -1 ? 'checked' : '';
            $('#fpp-WledEffects-systems').append(
                $('<label>' + v.hostname + ' (' + v.address + ')</label>').addClass(isChecked ? "selected" : "").prepend(
                    $('<input type="checkbox" ' + isChecked + '/>').data('address', v.address).on('change', function() {
                        if ($(this).is(':checked')) {
                            $(this).parent().addClass('selected');
                        } else {
                            $(this).parent().removeClass('selected');
                        }
                        handleSystemChecked();
                        $.when.apply(undefined, getUniqueModels()).then(() => {
                            renderModelSelections();
                            SaveWledEffectsConfig();
                        });
                    })
                )
            );
        });
        handleModelChecked();
        handleSystemChecked();
        $('#fpp-WledEffects-MultisyncEnabled').prop('checked', wledEffectsConfig.multisync).on('change', function() {
            wledEffectsConfig.multisync = $(this).is(':checked');

            // Immediately update systems
            handleMultisyncChecked();

            // Clear old models to force refresh
            uniqueModels = [];

            // Re-fetch and render with error handling
            $.when.apply(undefined, getUniqueModels()).then(() => {
                renderModelSelections();
                SaveWledEffectsConfig();
            }).fail(function() {
                console.error("Multisync model fetch failed after toggle");
                $('.fpp-WledEffects-Model-Selections').append('<p style="color:red;">Failed to load models from selected systems</p>');
            });
        });
    });

    if ($('#fpp-WledEffects-Colors button').length) {
        $('#fpp-WledEffects-Colors button').each(function(i) {
            var wledColorId = $(this).data('wled-color-id');
            $(this).colpick({
                colorScheme: 'flat',
                layout: 'rgbhex',
                color: wledEffectsConfig.colors[i] || '#ff0000',
                onSubmit: function(hsb, newHex) {
                    setWledColor(wledColorId, newHex);
                }
            }).css({backgroundColor: wledEffectsConfig.colors[i] || '#ff0000'});
        });
    }
}

function handleModelChecked() {
    var allChecked = true;
    $('.fpp-WledEffects-Model-Selections input[type=checkbox]').each(function() {
        if (!$(this).is(':checked')) allChecked = false;
    });
    $('.fpp-WledEffects-Model-Grouping-Heading input[type=checkbox]').prop('checked', allChecked);
    wledEffectsConfig.models = getSelectedModels();
}

function handleSystemChecked() {
    wledEffectsConfig.systems = getSelectedSystems();
}

function handleMultisyncChecked() {
    wledEffectsConfig.systems = [];
    $('#fpp-WledEffects-systems input[type=checkbox]').each(function() {
        if ($(this).is(':checked')) {
            var addr = $(this).data('address');
            if (addr) wledEffectsConfig.systems.push(addr);
            $(this).parent().addClass('selected');
        } else {
            $(this).parent().removeClass('selected');
        }
    });
}

function setWledColor(wledColorId, newHex) {
    $('[data-wled-color-id=' + wledColorId + ']').css({backgroundColor: '#' + newHex}).data('color', '#' + newHex).colpickHide();
    wledEffectsConfig.colors[wledColorId - 1] = '#' + newHex;
    SaveWledEffectsConfig();
}

function stopWledEffects() {
    $.ajax({
        type: "POST",
        url: 'api/command',
        dataType: 'json',
        data: JSON.stringify({
            "command": "Overlay Model Effect",
            "multisyncCommand": wledEffectsConfig.multisync,
            "multisyncHosts": wledEffectsConfig.systems.join(','),
            "args": [wledEffectsConfig.models.join(','), "Enabled", "Stop Effects"]
        }),
        contentType: 'application/json'
    });
}

function setWledEffect(options) {
    $.get("api/overlays/effects/" + options.effect).done(function(data) {
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
        if (inp.length) {
            var val = inp.val();
            if (inp.attr('type') === 'checkbox') {
                json["args"].push(inp.is(":checked") ? "true" : "false");
            } else {
                json["args"].push(val);
            }
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
        contentType: 'application/json'
    });
}

$(document).ready(function() {
    $.get('api/overlays/effects').done(function(data) {
        $.each(data, function(i, v) {
            var btn = $('<button>' + v + '</button>').click(function() {
                setWledEffect({effect: v});
                $('html, body').animate({
                    scrollTop: $('#fpp-WledEffects-controls-tab').offset().top - 100
                }, 500);
            });
            $('#availableWledEffects').append($('<div class="col-lg-4 col-md-66" />').append(btn));
        });
    });

    $.ajax({
        type: "GET",
        url: 'api/fppd/multiSyncSystems',
        dataType: 'json',
        success: function (data) {
            var systems = data.systems || [];
            var uniqueSystems = {};
            $.each(systems, function(i, v) {
                uniqueSystems[v.uuid || i] = v;
            });
            uniqueSystemIps = getUniqueSystemIps(uniqueSystems);

            $.ajax({
                type: "GET",
                url: 'api/configfile/plugin.fpp-WledEffects.json',
                cache: false,
                error: function() {
                    wledEffectsConfig = {
                        colors: ['#ff0000', '#00ff00', '#0000ff'],
                        brightness: 128,
                        speed: 128,
                        intensity: 128,
                        bufferMapping: 'Horizontal',
                        palette: 'Default',
                        multisync: false,
                        models: [],
                        systems: uniqueSystemIps
                    };
                    applyWLEDConfigToSystems(systems);
                },
                success: function (json) {
                    wledEffectsConfig = json || wledEffectsConfig;
                    applyWLEDConfigToSystems(systems);
                }
            });
        }
    });

    $('#fpp-WledEffects-reset').on('click', function() {
        $.ajax({ url: "plugin.php?plugin=fpp-WledEffects&page=resetpluginsettings.php" }).done(function() {
            $.jGrowl("Plugin settings reset", {themeState: 'success'});
            location.reload();
        });
    });

    $('#cancelEffects').on('click', stopWledEffects);

    $('.fpp-WledEffects-Model-Grouping-Heading input[type=checkbox]').on('change', function() {
        var checked = $(this).is(':checked');
        $(this).parent().parent().next().find('input[type=checkbox]').prop('checked', checked);
        $(this).parent().parent().next().find('label').toggleClass('selected', checked);
        wledEffectsConfig.models = getSelectedModels();
        SaveWledEffectsConfig();
    });

    $('.fpp-WledEffects-Model-Toggle').on('click', function() {
        $(this).parent().toggleClass('open');
        $(this).find('i').toggleClass('fa-chevron-down fa-chevron-up');
    });

    setTimeout(() => {
        $.when.apply(undefined, getUniqueModels()).then(() => {
            renderModelSelections();
            if (uniqueModels.length === 0) {
                setTimeout(() => $.when.apply(undefined, getUniqueModels()).then(renderModelSelections), 1500);
            }
        });
    }, 500);
});