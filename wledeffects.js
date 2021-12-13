$.ajax({
    type: "GET",
    url: 'fppjson.php?command=getPluginJSON&plugin=fpp-WledEffects',
    dataType: 'json',
    contentType: 'application/json',
    success: function (data) {
    }
});

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
