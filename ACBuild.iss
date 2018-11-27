; Script generated by the Inno Setup Script Wizard.
; SEE THE DOCUMENTATION FOR DETAILS ON CREATING INNO SETUP SCRIPT FILES!

#define AppId  "{{CCCDBFCF-CD8B-4728-915A-DCB71C1118BE}"
#define MyAppName "AlphaConsole" 
#define MyAppPublisher "AlphaConsole"
#define MyAppURL "http://www.alphaconsole.net"
#define MyAppExeName "AlphaConsole.exe"
#define SourceFiles "dist\win-ia32-unpacked"
#define MyAppVersion GetFileVersion(SourceFiles + "\" + MyAppExeName)
[Setup]
; NOTE: The value of AppId uniquely identifies this application.
; Do not use the same AppId value in installers for other applications.
; (To generate a new GUID, click Tools | Generate GUID inside the IDE.)
AppId={#AppId}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
;AppVerName={#MyAppName} {#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName=C:\AlphaConsole
DisableDirPage=yes
DisableProgramGroupPage=yes
OutputBaseFilename={#MyAppName}_Setup_{#MyAppVersion}
SetupIconFile=source\assets\img\app_icon.ico
Compression=lzma
SolidCompression=yes
OutputDir=dist
CloseApplicationsFilter=*.exe,*.dll,*.chm,RocketLeague.exe
CloseApplications=force
PrivilegesRequired=admin
DisableWelcomePage=yes
DisableReadyPage=yes
DisableFinishedPage=yes 
AllowCancelDuringInstall=no

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Files]
Source: "{#SourceFiles}\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs
Source: "{#SourceFiles}\resources\app.asar.unpacked\xapofx1_5.dll"; DestDir: "{app}\.."; Flags: ignoreversion
Source: "{#SourceFiles}\resources\app.asar.unpacked\discord-rpc.dll"; DestDir: "{app}\.."; Flags: ignoreversion   

[Icons]
Name: "{commondesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}" 
    
[Dirs]
Name: "{app}"; Permissions: users-full

[UninstallDelete] 
Type: files; Name: "{app}\..\xapofx1_5.dll"
Type: files; Name: "{app}\..\discord-rpc.dll"
Type: filesandordirs; Name: "{app}\resources\app.asar.unpacked\textures"
Type: filesandordirs; Name: "{app}\resources\app.asar.unpacked\config.json"
Type: dirifempty; Name: "{app}"

[Code] 
var
  UserPage: TInputFileWizardPage;
  FileSelector: TInputFileWizardPage; 
function GetHKLM: Integer;
begin
  if IsWin64 then
    Result := HKLM64
  else
    Result := HKLM32;
end;  

function IsAppRunning(const FileName: string): Boolean;
var
  FWMIService: Variant;
  FSWbemLocator: Variant;
  FWbemObjectSet: Variant;
begin
  Result := false;
  FSWbemLocator := CreateOleObject('WBEMScripting.SWBEMLocator');
  FWMIService := FSWbemLocator.ConnectServer('', 'root\CIMV2', '', '');
  FWbemObjectSet := FWMIService.ExecQuery(Format('SELECT Name FROM Win32_Process Where Name="%s"',[FileName]));
  Result := (FWbemObjectSet.Count > 0);
  FWbemObjectSet := Unassigned;
  FWMIService := Unassigned;
  FSWbemLocator := Unassigned;
end;
  
function FindRLUninstallKey(out ResultFolder: string) : Boolean;
var
  InstallFolder : String;
begin
  if RegQueryStringValue(GetHKLM, 'SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\Steam App 252950', 'InstallLocation', InstallFolder) then begin
    if FileExists(InstallFolder + '\Binaries\Win32\RocketLeague.exe') then begin       
      ResultFolder := InstallFolder + '\Binaries\Win32\AlphaConsole'
      Result := true
      Exit end end;   
  Result := false;
end;

function InputFileCheck(Page: TWizardPage): Boolean;
var
  Path: string;
  OPath: string;
  RLIndex: Integer;
begin
  Result := True;
  OPath := Trim(TInputFileWizardPage(Page).Values[0]);
  Path := OPath  
  if Length(OPath) = 0 then
  begin
    MsgBox('No path specified.', mbError, MB_OK);
    Result := False;
  end
  else begin
    RLIndex := Pos('\RocketLeague.exe', Path);    
    if RLIndex > 0 then begin
       Path := Copy(OPath, 0, RLIndex)
    end      
    if FileExists(Path + '\RocketLeague.exe') then begin
      WizardForm.DirEdit.Text := ExtractFilePath(Path) + '\AlphaConsole';
    end else begin
      MsgBox('RocketLeague.exe is not located in the selected path.', mbError, MB_OK);
      Result := False;
    end     
  end 
end;
const
  BN_CLICKED = 0;
  WM_COMMAND = $0111;
  CN_BASE = $BC00;
  CN_COMMAND = CN_BASE + WM_COMMAND;
  WM_QUIT = $0010;
   
function InitializeUninstall(): Boolean;
var 
  ErrorCode: Integer;
  rlwinHwnd: longint;
  retVal : boolean;
  MsgResult: Integer;
begin
  ShellExec('open','taskkill.exe','/f /im {#MyAppExeName}','',SW_HIDE,ewNoWait,ErrorCode);
  ShellExec('open','tskill.exe',' {#MyAppName}','',SW_HIDE,ewNoWait,ErrorCode);
  Result := True;
  while IsAppRunning('RocketLeague.exe') do begin
    MsgResult := MsgBox('Rocket League is running. Please close it before continuing.', mbError, MB_OKCANCEL);         
    if MsgResult = IDCANCEL then begin
       Result := False
       Break;
    end end;   
end;
  
procedure InitializeWizard();
var
  rlFolder : String;
  originalInstallation : String;
begin 
  if not(WizardForm.DirEdit.Text = 'C:\AlphaConsole') then begin
     if not(FileExists(WizardForm.DirEdit.Text + '\..\RocketLeague.exe')) then
        WizardForm.DirEdit.Text := 'C:\AlphaConsole'
  end;
  if WizardForm.DirEdit.Text = 'C:\AlphaConsole' then begin
    if FileExists('C:\Program Files (x86)\Steam\steamapps\common\rocketleague\Binaries\Win32\RocketLeague.exe') then begin
      WizardForm.DirEdit.Text := 'C:\Program Files (x86)\Steam\steamapps\common\rocketleague\Binaries\Win32\AlphaConsole'
    end
    else begin
      if FindRLUninstallKey(rlFolder) then
        WizardForm.DirEdit.Text := rlFolder 
      else begin
        UserPage := CreateInputFilePage(wpSelectDir, 'Select Rocket League Folder', 'Find RocketLeague.exe', 'The Setup could not find RocketLeague.exe. Please select it using the dialog below: ')
        UserPage.Add('Location of RocketLeague.exe:', 'RocketLeague.exe|RocketLeague.exe', 'RocketLeague.exe');
        UserPage.OnNextButtonClick := @InputFileCheck;      
      end 
    end 
  end;
end;  

procedure CurPageChanged(CurPageID: Integer);
var 
  winHwnd: longint;
  rlwinHwnd: longint;
  Param: Longint;
  ResultCode: Integer;
  Running: Boolean;
  retVal : boolean;
  MsgResult: Integer;
begin
  if CurPageID = wpReady then
  begin
    Param := 0 or BN_CLICKED shl 16;
    PostMessage(WizardForm.NextButton.Handle, CN_COMMAND, Param, 0);
  end; 
end;


function InitializeSetup(): Boolean;
var
  MsgResult: Integer;
begin
   Result := True;
   while IsAppRunning('RocketLeague.exe') do begin
      MsgResult := MsgBox('Rocket League is running. Please close it before continuing.', mbError, MB_OKCANCEL);         
      if MsgResult = IDCANCEL then begin
        Result := False
        Break;
      end; 
   end; 
end;


procedure CurStepChanged(CurStep: TSetupStep);
var
  Param: Longint;
  ResultCode: Integer;
begin
  if CurStep = ssPostInstall then
    ExecAsOriginalUser(ExpandConstant('{app}\{#MyAppExeName}'), '', '', SW_SHOWNORMAL, ewNoWait, ResultCode);    
end;






