
<div>
<link  rel="stylesheet" href="jquery/colpick/css/colpick.css"/>
<link  rel="stylesheet" href="plugin.php?plugin=fpp-WledEffects&file=wledeffects.css&nopage=1"/>
<script src="jquery/colpick/js/colpick.js"></script>
<script src="plugin.php?plugin=fpp-WledEffects&file=wledeffects.js&nopage=1"></script>


<!-- <button id="submitEffects">submit</button> -->

<div class="row tablePageHeader tablePageHeader">
    <div class="col">


    </div>
    <div class="col-auto ml-auto">
        <div class="form-actions form-actions-primary">

        <button id="cancelEffects" class="buttons btn-danger">Stop Effects</button>
        </div>
    </div>
</div>

<div class="row">
    <div class="col-xlg-4 col-lg-5 col-md-6">
    <ul class="nav nav-pills fpp-WledEffects-nav " role="tablist">
        <li class="nav-item" role="presentation">
            <a class="nav-link active" id="fpp-WledEffects-controls-tab-link" data-bs-toggle="pill" href="#fpp-WledEffects-controls-tab" role="tab" aria-controls="home" aria-selected="true"><i class="fas fa-sliders-h"></i></a>
        </li>
        <li class="nav-item" role="presentation">
            <a class="nav-link" id="fpp-WledEffects-settings-tab-link" data-bs-toggle="pill" href="#fpp-WledEffects-settings-tab" role="tab" aria-controls="profile" aria-selected="false"><i class="fas fa-cog"></i></a>
        </li>
    </ul>
    <div class="tab-content mt-2">
        
                <div class="tab-pane fade show active" id="fpp-WledEffects-controls-tab" role="tabpanel" aria-labelledby="fpp-WledEffects-controls-tab">
                    <div id="fpp-WledEffects-Models" class="mb-3">
                        <div class="backdrop">
                            <div class="fpp-WledEffects-Model-Grouping">
                                <div class="fpp-WledEffects-Model-Grouping-Heading">
                                    <label><input type="checkbox"> All Models</label>
                                </div>
                                <div class="fpp-WledEffects-Model-Selections">
                                    <div class="spinner-border spinner-danger spinner" role="status">
                                        <span class="sr-only">Loading...</span>
                                    </div>
                                    <button class="fpp-WledEffects-Model-Toggle"><i class="fas fa-chevron-down"></i></button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="fpp-WledEffects-Settings" class="backdrop mb-3">
                        <h2 id="EffectName">Effect</h2>
                        <table class="tblCommandEditor" id="wledTblCommandEditor">
                            <tbody>
                            </tbody>
                        </table>
                    </div>
                    <div id="fpp-WledEffects-Buttons" class="backdrop mb-3" style="display: none;">
                        <div class="row wledButtonRow">
                            <div class="col-6 wledButtonRowDiv">
                                <button id="runEffect1" class="buttons btn-success" onClick="RunWledEffect()">Run&nbsp;Effect</button>
                            </div>
                            <div class="col-6 wledButtonRowDiv">
                                <button id="cancelEffects1" class="buttons btn-danger" onClick="stopWledEffects()">Stop&nbsp;Effects</button>
                            </div>
                            <!--
                            <div class="col-4 wledButtonRowDiv">
                                <button id="cancelEffects1" class="buttons" onClick="AddPreset()">Add&nbsp;Preset</button>
                            </div>
                            -->
                        </div>
                    </div>
                </div>
            <div class="tab-pane fade" id="fpp-WledEffects-settings-tab" role="tabpanel" aria-labelledby="fpp-WledEffects-settings-tab">

            <div class="backdrop mb-4">
                <div class="backdrop-dark form-inline enableCheckboxWrapper mb-2">

                        <div class="mr-2"><b>Multisync:</b></div>
                        <div> <input type="checkbox" id="fpp-WledEffects-MultisyncEnabled"></div>

                </div>
                <div id="fpp-WledEffects-systems">
                </div>
             </div>  
                <div class="backdrop mb-4">
                    <button class="buttons btn-danger" id="fpp-WledEffects-reset">Reset WLED Effects Plugin</button>
                    <p><small class="form-text text-muted">You can reset the plugin configuration if you experiencing issues.</small></p>
                    
                </div>
            </div>
    </div>

    </div>
    <div class="col-xlg-8 col-lg-7 col-md-6">
 
        <div id="availableWledEffects" class="row"></div>
    </div>
</div>
</div>
