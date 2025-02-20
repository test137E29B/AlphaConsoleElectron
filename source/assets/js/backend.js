const con = require('electron').remote.getGlobal('console');



var SyncTeams = true;

var GlobalACConfig = {};

function ToggleSyncTeams() {

  SyncTeams = !SyncTeams;
  if (SyncTeams) {
    $("#button-sync-teams").css("background-color", "");
    $("#button-sync-teams").css("border-color", "");
  } else {
    $("#button-sync-teams").css("background-color", "#f00");
    $("#button-sync-teams").css("border-color", "#f44");
  }

}




function CopyFile(source, target) {
  var fs = require('fs');
  var rd = fs.createReadStream(source);
  var wr = fs.createWriteStream(target);
  return new Promise(function (resolve, reject) {
    rd.on('error', reject);
    wr.on('error', reject);
    wr.on('finish', resolve);
    rd.pipe(wr);
  }).catch(function (error) {
    rd.destroy();
    wr.end();
    throw error;
  });
}

function LoadFile(path) {
  var fs = require("fs");
  return fs.readFileSync(path);
}

function GetBasePath() {

  return require("path").dirname(__dirname).replace('app.asar', 'app.asar.unpacked');

}

function LoadItems() {
  var contents = LoadFile(GetBasePath() + "/items.json");
  var contents2 = LoadFile(GetBasePath() + "/slotDictionary.json");
  var products = JSON.parse(contents);
  var lookup = JSON.parse(contents2);
  products.Lookup = lookup;
  return products;
}

function FileExists(path) {
  var fs = require('fs');
  return fs.existsSync(path);
}


//Todo add a browse for directory thing idk help pls
function DetectInstallLocation() {
  if (FileExists("C:/Program Files (x86)/Steam/steamapps/common/rocketleague/Binaries/Win32/RocketLeague.exe")) {
    document.getElementById("install-location").value =
      "C:/Program Files (x86)/Steam/steamapps/common/rocketleague/Binaries/Win32/";
  }
  else if (FileExists("C:/Program Files/Steam/steamapps/common/rocketleague/Binaries/Win32/RocketLeague.exe")) {
    document.getElementById("install-location").value =
      "C:/Program Files/Steam/steamapps/common/rocketleague/Binaries/Win32/";
  } else {
    //failed, prompt for directory

    //should notify user that we could not detect the rl installation

    const {
      dialog
    } = require('electron').remote
    dialog.showOpenDialog({
      defaultPath: "C:\\",
      title: "Choose your Rocket League executable",
      filters: [{
        name: 'Executables',
        extensions: ['exe']
      }],
      properties: ['openFile']
    }, (fileName) => {
      if (fileName === undefined) {
        alert("No install location selected");
        $('#status-message').text("Failed to find install location")
        return;
      } else {
        document.getElementById("install-location").value = require("path").dirname(fileName[0]) + "\\"; //dum slashes
      }
    })
  }
}

function openPage(pageName, elmnt, color) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablink");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].style.backgroundColor = "";
  }
  document.getElementById(pageName).style.display = "block";
  elmnt.style.backgroundColor = color;

}

// Get the element with id="defaultOpen" and click on it
document.getElementById("defaultOpen").click();

function PlaceFiles() {
  var fs = require('fs');
  $('#status-message').text("Applying...")
  if (FileExists(document.getElementById("install-location").value + "RocketLeague.exe")) {

    if (!FileExists(document.getElementById("install-location").value + "/discord-rpc.dll")) {
      CopyFile(GetBasePath() + "/discord-rpc.dll", document.getElementById("install-location").value +
        "/discord-rpc.dll");
    } else {
      var stats = fs.statSync(document.getElementById("install-location").value + "/discord-rpc.dll");
      var mtime = new Date(stats.mtime).getTime();
      var stats2 = fs.statSync(GetBasePath() + "/discord-rpc.dll");
      var mtime2 = new Date(stats2.mtime).getTime();
      if (mtime2 > mtime) {
        CopyFile(GetBasePath() + "/discord-rpc.dll", document.getElementById("install-location").value +
          "/discord-rpc.dll");
      }
    }
    if (!FileExists(document.getElementById("install-location").value + "/xapofx1_5.dll")) {
      CopyFile(GetBasePath() + "/AlphaConsole.dll", document.getElementById("install-location").value +
        "/xapofx1_5.dll");
    } else {
      var stats = fs.statSync(document.getElementById("install-location").value + "/xapofx1_5.dll");
      var mtime = new Date(stats.mtime).getTime();
      var stats2 = fs.statSync(GetBasePath() + "/AlphaConsole.dll");
      var mtime2 = new Date(stats2.mtime).getTime();
      if (mtime2 > mtime) {
        CopyFile(GetBasePath() + "/AlphaConsole.dll", document.getElementById("install-location").value +
          "/xapofx1_5.dll");
      }
    }

    CopyFile(GetBasePath() + "/config.json", document.getElementById("install-location").value + "/config.json");

    $('#status-message').text("Applied: Items & Options loaded successfully")
  } else {
    $('#status-message').text("Failed!")
    alert("Rocket League path not set or incorrect! Set it in General settings.");
  }
}


function OpenColorPicker(button) {


}



function LoadConfiguration() {

  var Config = JSON.parse(LoadFile(GetBasePath() + "/config.json"));

  GlobalACConfig = Config;

  for (var preset in GlobalACConfig.Presets) {
    if (preset != 0) {
      AddPreset(preset, GlobalACConfig.Presets[preset].Name);
    }
  }

  LoadPreset(Config.Preset);

  $("#preset-select").val(Config.Preset);

  //Custom color options

  $("#color-all-cars").prop("checked", Config.CustomColors.ColorAllCars);

  $("#field-color-blue").val(Config.CustomColors.FieldBlue);
  $("#field-color-orange").val(Config.CustomColors.FieldOrange);
  $("#enable-field-color").prop('checked', Config.CustomColors.EnableFieldColors);

  //Custom title options
  $("#enable-custom-titles").prop('checked', Config.CustomTitles.EnableCustomTitles);
  $("#enable-custom-banners").prop('checked', Config.CustomTitles.EnableCustomBanners);
  $("#title-flash-rate").val(Config.CustomTitles.TitleFlashRate);

  //Custom rank options
  $("#display-mmr").prop('checked', Config.RankOptions.DisplayMMR);
  $("#enable-unranked-mmr").prop('checked', Config.RankOptions.UnrankedMMR);
  $("#display-teamTotal").prop('checked',  Config.RankOptions.TeamTotal);
  $("#display-teamMMR").prop('checked', Config.RankOptions.DisplayTeamMMR);
  $("#upload-match-data").prop('checked', Config.RankOptions.UploadMatchData);
  $("#april-fools").prop('checked', Config.RankOptions.AprilFools || 0);

  //Discord rich presence options
  $("[name='discord'][value=" + Config.DiscordOptions.RichPresenceLevel + "]").prop("checked", true);

  //Trade Options
  $("#trade-save-log").prop('checked', Config.TradeOptions ? Config.TradeOptions.SaveLog : true)
  $("#trade-enable-modal").prop('checked', Config.TradeOptions ? Config.TradeOptions.ShowModal : true)
  $("#trade-enable-popups").prop('checked', Config.TradeOptions ? Config.TradeOptions.ShowPopups : true)
  if (Config.TradeOptions && Config.TradeOptions.LogLocation && Config.TradeOptions.LogLocation.length > 3) {

    $("#trade-log-location").css("display", "none");
    $("#trade-log-location-template").css("display", "block");
    $("#trade-log-location-text").prop("value", Config.TradeOptions.LogLocation);
  }

  //General options
  $("#ac-enabled").prop('checked', Config.GeneralOptions.Enabled);
  $("#broadcast-enabled").prop('checked', Config.GeneralOptions.EventBroadcast);
  $("#minimize-to-tray").prop('checked', Config.GeneralOptions.MinimizeToTray);
  $("#run-on-startup").prop('checked', Config.GeneralOptions.RunOnStartup);
  $("#install-location").val(Config.GeneralOptions.InstallLocation);
  $("#f5-menu").prop('checked', Config.GeneralOptions.F5Menu);

  $("#always-on-top").prop('checked', Config.AlwaysOnTop);
  
  if (!Config.GeneralOptions.SyncTeams) {
    ToggleSyncTeams();
  }

  const request = require('request');

  request("https://api.github.com/repos/AlphaConsole/AlphaConsoleElectron/releases", {
    headers: {
      "User-Agent": "AlphaConsole"
    }
  }, (err, result, body) => {
    let data = JSON.parse(body);
    data = [data[0], data[1], data[2]];
    let text = data.map(t => {
      let temp = `<h3>Update ${t.tag_name}</h3><p>${t.body.replace(/-/g, "<br/>-")}</p>`;
      temp = temp.replace("</h3><p><br/>", "</h3><p>");

      return temp;
    }).join("<br/>");

    $("#changelogsInfo").html(text);
    if (!Config.LastVersion || Config.LastVersion !== require('electron').remote.app.getVersion()) {
      let lastVersion = data[0];
      let changelogs = `<h3>${lastVersion.tag_name}</h3><p>${lastVersion.body.replace(/-/g, "<br/>-")}</p>`;
      changelogs = changelogs.replace("</h3><p><br/>", "</h3><p>");

      $("#promptTitle").html("New Update Installed");
      $("#promptContent").html(changelogs);
      $("#prompt").css("display", "block");

      const fs = require('fs');

      Config.LastVersion = require('electron').remote.app.getVersion();
      fs.writeFileSync(GetBasePath() + '/config.json', JSON.stringify(Config, null, "\t"), 'utf-8');
    }
  })

}

function AddPreset(ID, Name) {

  var newOp = $('<option>');
  newOp.attr('value', ID);
  newOp.text(Name);

  $("#preset-select").append(newOp);
  
}

function AddNewPreset() {

  SavePreset($("#preset-select").val());

  var id = Math.floor(Math.random() * 100000); //lazy
  AddPreset(id, "New preset");
  $("#preset-name").prop('readonly', false);
  $("#preset-name").val("New preset");
  $("#preset-select").val(id);
  SavePreset(id);

}


function DeletePreset() {

  if ($("#preset-select").val() == 0) {
    return;
  }

  delete GlobalACConfig.Presets[$("#preset-select").val()];
  $('#preset-select option[value=' + $("#preset-select").val() + ']').remove();

  $("#preset-select").val(0);
  LoadPreset(0);

}

function SavePreset(PresetID) {

  var Products = LoadItems();
  var colors = Products.Colors;
  var slots = Products.Slots;

  //Custom item options
  var Items = {};
  for (var i = 0; i < slots.length; i++) {
    if (slots[i] != null) {

      var slotID = slots[i].SlotID;

      Items[slotID] = {};
      Items[slotID].SlotName = slots[i].Name;

      if (slots[i].Name == "Body") {
        $("select[name='color-select'][special='body']").each((index, value) => {
          var team = $(value).closest('tbody').attr("team");
          Items[slotID][team] = {};
          Items[slotID][team].ItemID = -1
          Items[slotID][team].PackageID = -1;
          Items[slotID][team].PackageSubID = -1;
          Items[slotID][team].Color = parseInt($(value).val()) || -1;
        })
      }

      var selects = $('select[name="' + Products.Lookup[slots[i].Name] + '"]');
      for (var j = 0; j < selects.length; j++) {

        var team = $(selects[j]).closest('tbody').attr("team");

        Items[slotID][team] = {};
        if ($(selects[j]).val()) {
          var iid = $(selects[j]).val().split(":");

          Items[slotID][team].ItemID = parseInt(iid[0]);
          Items[slotID][team].PackageID = parseInt(iid[1]);
          Items[slotID][team].PackageSubID = parseInt(iid[2]);
        } else {

          Items[slotID][team].ItemID = -1;
          Items[slotID][team].PackageID = -1;
          Items[slotID][team].PackageSubID = -1;
        }

        Items[slotID][team].Color = parseInt($(selects[j]).parent().next("td").find("select").val()) || -1;
		Items[slotID][team].SpecialEdition = $(selects[j]).parent().parent().find("input").prop('checked') ? 1 :  -1;
      }
    }
  }

  //custom colors in presets
  var CustomColors = {};
  CustomColors.Blue = {};
  CustomColors.Orange = {};
  CustomColors.Blue.PrimaryColor = $("#primary-color-blue").val();
  CustomColors.Blue.AccentColor = $("#accent-color-blue").val();
  CustomColors.Orange.PrimaryColor = $("#primary-color-orange").val();
  CustomColors.Orange.AccentColor = $("#accent-color-orange").val();
  CustomColors.Blue.PrimaryIntensity = parseFloat($("#primary-intensity-blue").val());
  CustomColors.Blue.AccentIntensity = parseFloat($("#accent-intensity-blue").val());
  CustomColors.Orange.PrimaryIntensity = parseFloat($("#primary-intensity-orange").val());
  CustomColors.Orange.AccentIntensity = parseFloat($("#accent-intensity-orange").val());
  CustomColors.Blue.Enabled = $("#custom-color-enabled-blue").prop('checked');
  CustomColors.Orange.Enabled = $("#custom-color-enabled-orange").prop('checked');


  if (GlobalACConfig.Presets === undefined) {
    GlobalACConfig.Presets = {};
  }

  GlobalACConfig.Presets[PresetID] = {};
  GlobalACConfig.Presets[PresetID].Items = Items;

  GlobalACConfig.Presets[PresetID].CustomColors = CustomColors;

  if (PresetID == 0) {
    GlobalACConfig.Presets[PresetID].Name = "Default";
  } else {
    GlobalACConfig.Presets[PresetID].Name = $("#preset-name").val();
  }

}

function LoadPreset(ID) {

  var OldSync = SyncTeams;
  SyncTeams = false;
  $("#preset-name").val(GlobalACConfig.Presets[ID].Name);

  if (ID == 0) {
    $("#preset-name").prop('readonly', true);
  } else {
    $("#preset-name").prop('readonly', false);
  }

  var Products = LoadItems();

  var colors = Products.Colors;
  var slots = Products.Slots;

  //Custom item options
  for (var i = 0; i < slots.length; i++) {
    if (slots[i] != null) {

      if (slots[i].Name == "Body") {
        $("select[name='color-select']").each((index, value) => {
          var team = $(value).closest('tbody').attr("team");
          $("tbody[team='" + team + "']").find("select[name='color-select'][special='body']").val(GlobalACConfig.Presets[ID].Items[
            slots[i].SlotID][team].Color);
        })
      }

      var selects = $('select[name="' + Products.Lookup[slots[i].Name] + '"]');
      for (var j = 0; j < selects.length; j++) {
        var team = $(selects[j]).closest('tbody').attr("team");
        var valString = GlobalACConfig.Presets[ID].Items[slots[i].SlotID][team].ItemID + ":" + GlobalACConfig.Presets[ID].Items[slots[i].SlotID][team].PackageID +
          ":" + GlobalACConfig.Presets[ID].Items[slots[i].SlotID][team].PackageSubID;
        $(selects[j]).val(valString).change();
        $(selects[j]).parent().next("td").find("select").val(GlobalACConfig.Presets[ID].Items[slots[i].SlotID][team].Color);
		$(selects[j]).parent().parent().find("input").prop('checked', GlobalACConfig.Presets[ID].Items[slots[i].SlotID][team].SpecialEdition == -1 ? false : true);
		
      }
    }
  }


  //custom color options
  $("#primary-color-blue").val(GlobalACConfig.Presets[ID].CustomColors.Blue.PrimaryColor);
  $("#accent-color-blue").val(GlobalACConfig.Presets[ID].CustomColors.Blue.AccentColor);
  $("#primary-color-orange").val(GlobalACConfig.Presets[ID].CustomColors.Orange.PrimaryColor);
  $("#accent-color-orange").val(GlobalACConfig.Presets[ID].CustomColors.Orange.AccentColor);
  $("#primary-intensity-blue").val(GlobalACConfig.Presets[ID].CustomColors.Blue.PrimaryIntensity);
  $("#accent-intensity-blue").val(GlobalACConfig.Presets[ID].CustomColors.Blue.AccentIntensity);
  $("#primary-intensity-orange").val(GlobalACConfig.Presets[ID].CustomColors.Orange.PrimaryIntensity);
  $("#accent-intensity-orange").val(GlobalACConfig.Presets[ID].CustomColors.Orange.AccentIntensity);
  $("#custom-color-enabled-blue").prop('checked', GlobalACConfig.Presets[ID].CustomColors.Blue.Enabled);
  $("#custom-color-enabled-orange").prop('checked', GlobalACConfig.Presets[ID].CustomColors.Orange.Enabled);


  
  $("#alpha-color-blue").val(GlobalACConfig.Presets[ID].CustomColors.BlueAlpha || "#000000");
  $("#alpha-color-orange").val(GlobalACConfig.Presets[ID].CustomColors.OrangeAlpha || "#000000");
  
  $("#alpha-enabled-blue").prop('checked', GlobalACConfig.Presets[ID].CustomColors.BlueAlphaEnabled || false);
  $("#alpha-enabled-orange").prop('checked', GlobalACConfig.Presets[ID].CustomColors.OrangeAlphaEnabled || false);
  
  SyncTeams = OldSync;

}


function GetConfigurationString() {

  var Config = {};

  Config.Preset = $("#preset-select").val();
  SavePreset(Config.Preset);

  Config.Items = GlobalACConfig.Presets[Config.Preset].Items;
  Config.Presets = GlobalACConfig.Presets;

  //Custom color options
  var CustomColors = GlobalACConfig.Presets[Config.Preset].CustomColors;
  CustomColors.ColorAllCars = $("#color-all-cars").prop('checked');

  Config.CustomColors = CustomColors;
  
  Config.CustomColors.FieldBlue = $("#field-color-blue").val();
  Config.CustomColors.FieldOrange = $("#field-color-orange").val();
  
  Config.CustomColors.EnableFieldColors = $("#enable-field-color").prop('checked');

  Config.CustomColors.BlueAlphaEnabled = $("#alpha-enabled-blue").prop('checked');
  Config.CustomColors.OrangeAlphaEnabled = $("#alpha-enabled-orange").prop('checked');

  Config.CustomColors.BlueAlpha = $("#alpha-color-blue").val();
  Config.CustomColors.OrangeAlpha = $("#alpha-color-orange").val();

  //Custom title options
  var CustomTitles = {};
  CustomTitles.EnableCustomTitles = $("#enable-custom-titles").prop('checked'); 
  CustomTitles.EnableCustomBanners = $("#enable-custom-banners").prop('checked'); 
  CustomTitles.TitleFlashRate = parseFloat($("#title-flash-rate").val());
  Config.CustomTitles = CustomTitles;


  //Custom rank options
  var RankOptions = {};
  RankOptions.DisplayMMR = $("#display-mmr").prop('checked');
  RankOptions.UnrankedMMR = $("#enable-unranked-mmr").prop('checked');
  RankOptions.UploadMatchData = $("#upload-match-data").prop('checked');
  RankOptions.TeamTotal = $("#display-teamTotal").prop('checked');
  RankOptions.DisplayTeamMMR = $("#display-teamMMR").prop('checked');
  RankOptions.AprilFools = $("#april-fools").prop('checked');
  Config.RankOptions = RankOptions;

  //Discord rich presence options
  var DiscordOptions = {};
  DiscordOptions.RichPresenceLevel = parseInt($("[name='discord']:checked").val());
  Config.DiscordOptions = DiscordOptions;

  //Trading options
  var TradeOptions = {};
  TradeOptions.SaveLog = $("#trade-save-log").prop('checked');
  TradeOptions.LogLocation = $("#trade-log-location-text").val().length > 3 ? $("#trade-log-location-text").val() : "trades.log";
  TradeOptions.ShowModal = $("#trade-enable-modal").prop('checked');
  TradeOptions.ShowPopups = $("#trade-enable-popups").prop('checked');
  Config.TradeOptions = TradeOptions;

  //General options
  var GeneralOptions = {};
  GeneralOptions.Enabled = $("#ac-enabled").prop('checked');
  GeneralOptions.MinimizeToTray = $("#minimize-to-tray").prop('checked');
  GeneralOptions.RunOnStartup = $("#run-on-startup").prop('checked');
  GeneralOptions.InstallLocation = $("#install-location").val();
  GeneralOptions.EventBroadcast = $("#broadcast-enabled").prop('checked');
  GeneralOptions.F5Menu = $("#f5-menu").prop('checked');
  GeneralOptions.SyncTeams = SyncTeams;
  Config.GeneralOptions = GeneralOptions;

  Config.LastVersion = require('electron').remote.app.getVersion();
  Config.AlwaysOnTop = $("#always-on-top").prop('checked');

  //Miscellaneous
  Config.ACPath = GetBasePath();

  console.log(Config);

  return JSON.stringify(Config, null, "\t");
}

function SaveConfiguration() {

  var fs = require('fs');
  try {
    $('#status-message').text("Applying...")
    fs.writeFileSync(GetBasePath() + '/config.json', GetConfigurationString(), 'utf-8');
    $('#status-message').text("Applied: Items & Options loaded successfully!");
    //Add a copy to Win32 so that you can load prefs from local one? idk
    //PlaceFiles();
  } catch (e) {
    $('#status-message').text("Failed!")
    alert(e);
    alert('Failed to save the configuration!');

  }

}


function ShowTexturesRepo() {
  const remote = require('electron').remote;
  const BrowserWindow = remote.BrowserWindow;

  const path = require('path');
  const url = require('url')

  var win =
    new BrowserWindow({
      titleBarStyle: 'hidden',
      resizable: true,
      frame: false,
      minWidth: 720,
      maxWidth: 720,
      width: 720,
      height: 930,
      webPreferences: {
        devTools: true
      },
      icon: path.join(__dirname, '/assets/img/logo_normal.png')
    })

  win.loadURL(
    url.format(
      {
        pathname: path.join(__dirname, 'texture-repo.html'),
        protocol: 'file:',
        slashes: true
      }
    ));

}

function GetTexturePackagePaths() {

  var walkSync = function (dir, filelist) {
    var fs = require('fs');
    var path = require('path');

    // Check if textures folder exist. If it doesn't exist return empty array. You could potentially create a textures folder now and return empty array.
    if (!fs.existsSync(dir)) return [];

    files = fs.readdirSync(dir);

    filelist = filelist || [];
    files.forEach(function (file) {
      if (fs.statSync(dir + file).isDirectory()) {
        filelist = walkSync(dir + file + '/', filelist);
      } else {
        if (file == 'package.json')
          filelist.push(dir + file);
      }
    });
    return filelist;
  }

  return walkSync(GetBasePath() + "/textures/", []);
}

function GetTexturePackages() {

  var path = require('path');
  var paths = GetTexturePackagePaths();
  var tps = [];
  var packs = {};
  packs.packages = [];

  for (var i = 0; i < paths.length; i++) {

    var tp = {};
    tp.Path = paths[i];
    tp.Package = JSON.parse(LoadFile(paths[i]));
    packs.packages[i] = {};
    packs.packages[i].id = tp.Package.id;
    packs.packages[i].name = tp.Package.name;
    packs.packages[i].folder = path.dirname(paths[i].substring((GetBasePath() + "/textures/").length));
    packs.packages[i].author = tp.Package.author;
    packs.packages[i].description = tp.Package.description;

    tps.push(tp);

  }



  SaveMasterPackages(packs);

  return tps;
}

function SaveMasterPackages(packages) {
  var fs = require('fs');
  try {
    fs.mkdir(GetBasePath() + '/textures/');
    fs.writeFileSync(GetBasePath() + '/textures/packages.json', JSON.stringify(packages, null, "\t"), 'utf-8');
  } catch (e) {
    alert(e);
    alert('Failed to save the packages!');
  }
}


// function for dynamic sorting
function compareValues(key, order = 'asc') {
  return function (a, b) {
    if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
      // property doesn't exist on either object
      return 0;
    }

    const varA = (typeof a[key] === 'string') ?
      a[key].toUpperCase() : a[key];
    const varB = (typeof b[key] === 'string') ?
      b[key].toUpperCase() : b[key];

    let comparison = 0;
    if (varA > varB) {
      comparison = 1;
    } else if (varA < varB) {
      comparison = -1;
    }
    return (
      (order == 'desc') ? (comparison * -1) : comparison
    );
  };
}



var Products = LoadItems();
var TexturePackages = GetTexturePackages();

var colors = Products.Colors;
colors.sort(compareValues('Name'));
$("select[name='color-select']").each(function (index, value) {

  for (var i = 0; i < colors.length; i++) {

    var newOp = $('<option>');
    newOp.attr('value', colors[i].ID);
    newOp.text(colors[i].Name);

    $(this).append(newOp);
  }

});

var slots = Products.Slots;
var customItems = {}

for (var j = 0; j < TexturePackages.length; j++) {
  
  var customitems = TexturePackages[j].Package.items;
  customitems.sort(compareValues(name));
  for (var k = 0; k < customitems.length; k++) {
    var v = slots.findIndex(x => x.SlotID==customitems[k].slot);
    if(v > -1){
      if(!slots[v].customItems) slots[v].customItems = []
      customitems[k].packageid = TexturePackages[j].Package.id;
      slots[v].customItems.push(customitems[k]); 
    }    
  }
}

for (var i = 0; i < slots.length; i++) {

  if (slots[i] != null) {

    var items = slots[i].Items;
    items.sort(compareValues('Name'));


    //VANILLA ITEMS
    for (var j = 0; j < items.length; j++) {
      //Will .each fuck this up because of async?
      $('select[name="' + Products.Lookup[slots[i].Name] + '"]').each(function (index, value) {
        var newOp = $('<option>');
        newOp.attr('value', items[j].ItemID + ":" + -1 + ":" + -1);
        newOp.attr('paintable', items[j].Paintable);
        newOp.attr('hasSpecialEditions', items[j].HasSpecialEditions);
		newOp.text(items[j].Name);
        $(this).append(newOp);

      });
    }

    //CUSTOM ITEMS
    if(slots[i].customItems){
      var customitems = slots[i].customItems;
      
      customitems.sort(compareValues('name'));
      $('select[name="' + Products.Lookup[slots[i].Name] + '"]').each(function (index, value) {
        var newOp = $('<option>');
        newOp.attr('value', '-2:-2:-2');
        newOp.text("-----------------------------------------------------------------");   
        newOp.attr("disabled", "disabled");      
        $(this).children(":first").after(newOp);
      });
     
      for (var k = customitems.length-1; k >=0; k--) {         

        $('select[name="' + Products.Lookup[slots[i].Name] + '"]').each(function (index, value) {
          var newOp = $('<option>');
          newOp.attr('value', customitems[k].item + ":" + customitems[k].packageid + ":" + customitems[k].id);
          newOp.html(customitems[k].name);            
          $(this).children(":first").after(newOp);  
        });
    
      }
      
      $('select[name="' + Products.Lookup[slots[i].Name] + '"]').each(function (index, value) {
        var newOp = $('<option>');
        newOp.attr('value', '-2:-2:-2');
        newOp.text("Custom");   
        newOp.attr("disabled", "disabled");      
        $(this).children(":first").after(newOp);
      });
      
    }
  }
}



//Keep ball slots the same
$("select[name='ball-select']").on('change', function () {
  $("select[name='ball-select']").val(this.value);
});

$("select[name='color-select']").on('change', function () {
  if (SyncTeams) {

    var selects = $("select[name='color-select']");
    for (var k = 0; k < selects.length; k++) {

      if ($(selects[k]).parent().parent().index() == $(this).parent().parent().index()) {
        $(selects[k]).val(this.value);
      }
    }
  }
});
$("input[name='special-wheel-input']").on('change', function () {  
  if (SyncTeams) {
    var selects = $("input[name='special-wheel-input']");
    for (var k = 0; k < selects.length; k++) {
        
		$(selects[k]).prop('checked', $(this).prop('checked'));      
    }
	}
});


$("[class='row teams'] select").on('change', function () {


  var id = $(this).val().split(":")[0];


  var disableOtherPaintable = false;
  if($(this).find("option:selected").attr("Paintable") == "false"){    
	disableOtherPaintable = true;
    $(this).parent().next().find("select").prop('disabled', 'disabled');
    $(this).parent().next().find("select").css("color", "#555");
  } else {
    $(this).parent().next().find("select").prop('disabled', false);
    $(this).parent().next().find("select").css("color", "#fff");
  }
  var disableOtherSpecial = false;
  if($(this).find("option:selected").attr("HasSpecialEditions") == "false"){
    disableOtherSpecial = true;
    $(this).parent().parent().find("input").prop('disabled', 'disabled');
    $(this).parent().parent().find("input").parent().find("span").css("background-color", "#3D3D3D");
  } else {
    $(this).parent().parent().find("input").prop('disabled', false);
    $(this).parent().parent().find("input").parent().find("span").css("background-color", "#616161");
  }

  if (SyncTeams) {

    var selects = $("[class='row teams'] select");

    for (var k = 0; k < selects.length; k++) {

      if ($(selects[k]).parent().parent().index() == $(this).parent().parent().index()
        && $(this).parent().index() == 1 && $(selects[k]).parent().index() == 1) {
        $(selects[k]).val(this.value);

        if(disableOtherPaintable){
          $(selects[k]).parent().next().find("select").prop('disabled', 'disabled');
          $(selects[k]).parent().next().find("select").css("color", "#555");
        } else {
          $(selects[k]).parent().next().find("select").prop('disabled', false);
          $(selects[k]).parent().next().find("select").css("color", "#fff");
        }
		if(disableOtherSpecial){
			$(selects[k]).parent().parent().find("input").prop('disabled', 'disabled');
			$(selects[k]).parent().parent().find("input").parent().find("span").css("background-color", "#3D3D3D");
		} else {
			$(selects[k]).parent().parent().find("input").prop('disabled', false);
			$(selects[k]).parent().parent().find("input").parent().find("span").css("background-color", "#616161");
        }
      }
    }
  }
});


var previousPresetID;

$("#preset-select").focus(function () {
  previousPresetID = this.value;
});


$("#preset-select").change(function () {
  SavePreset(previousPresetID);
  LoadPreset(this.value);
  SaveConfiguration();
  previousPresetID = this.value;
});


const { ipcRenderer } = require('electron');
  
$("#always-on-top").change(function () {
  
  console.log($(this).prop('checked'));

  ipcRenderer.send('alwaystop', $(this).prop('checked'));  

});

$("#button-check-for-updates").on("click", function(){

  ipcRenderer.send("check-for-updates");  
  
});



$("#preset-name").on("input", function () {
  $('#preset-select option[value=' + $("#preset-select").val() + ']').text(this.value);
});


$(document).ready(function () {
  $(".teams .item-table .acc-input").after("<span class='reset-input'> ✗</span>");
  $('.reset-input').on('click', function () {    
    if(SyncTeams) {
      $("select[name=" + $(this).parent().find('select').attr('name') + "] option:contains('Unchanged')").prop('selected', true);
    }
    else {
      $(this).parent().find('select option:contains("Unchanged")').prop('selected', true);
    }
  })
  $('#button-reset-all').on('click', function () {        
      $(".teams select option:contains('Unchanged')").prop('selected', true);
      $(".teams select").prop('disabled', false).css("color", "#fff");
      $("#custom-color-enabled-blue").prop('checked', false);
      $("#custom-color-enabled-orange").prop('checked', false);      
      $("#primary-color-blue").val("#000");
      $("#primary-intensity-blue").val(1);
      $("#accent-color-blue").val("#000");
      $("#accent-intensity-blue").val(1);
      $("#primary-color-orange").val("#000");
      $("#primary-intensity-orange").val(1);
      $("#accent-color-orange").val("#000");
      $("#accent-intensity-orange").val(1);     
      $("#special-wheel-blue").prop('checked', false);
      $("#special-wheel-orange").prop('checked', false);      
  })
  
  $(".build-number").html("Version " + require('electron').remote.app.getVersion());
   ipcRenderer.send('alwaystop', $("#always-on-top").prop('checked'));  
});


LoadConfiguration();