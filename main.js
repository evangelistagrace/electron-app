const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu, ipcMain, Tray} = electron;
const AutoLaunch = require('auto-launch')
// const ElectronSampleAppLauncher = new AutoLaunch({
//   name: 'ShoppingList'
// });

const appLauncher = new AutoLaunch({
    name: 'ShoppingList'
  })

let mainWindow,
    addWindow,
    preferenceWindow,
    tray = null,
    auto_launch = 0;

//set env
process.env.NODE_ENV = 'production';


//listen for app to be ready
app.on('ready', function(){
    //create new window
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        }
    });

    //load html into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file',
        slashes: true
    }));

    //auto launch
    if(auto_launch === 0) {
        disableAutoLaunch();
    } else{
        enableAutoLaunch();
    }


    //close all windows and quit app when closed
    mainWindow.on('closed', function() {
        app.quit();
    })

    // build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);

    Menu.setApplicationMenu(mainMenu);

    //tray
    tray = new Tray(path.join(__dirname, '/assets/icons/png/Icon.png'));
    const contextMenu = Menu.buildFromTemplate([
        { label: 'Item1', type: 'radio' },
        { label: 'Item2', type: 'radio' },
        { label: 'Item3', type: 'radio', checked: true },
        { label: 'Item4', type: 'radio' }
      ])
    tray.setToolTip('This is my application.')
    tray.setContextMenu(contextMenu)
});

function enableAutoLaunch () {
    console.log('enabled')
    return appLauncher
      .isEnabled()
      .then(enabled => {
        if (!enabled) return appLauncher.enable()
      })
  }
  
  function disableAutoLaunch () {
      console.log('disabled')
    return appLauncher
      .isEnabled()
      .then(enabled => {
        if (enabled) return appLauncher.disable()
      })
  }

//handle create add window
function createAddWindow() {
    //create new window
    addWindow = new BrowserWindow({
        width: 300,
        height: 200,
        title: 'Add shopping list item',
        webPreferences: {
            nodeIntegration: true
        }
    });

    //load html into window
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'addWindow.html'),
        protocol: 'file',
        slashes: true
    }));

    //garbage collection handle
    addWindow.on('close', function() {
        addWindow = null;
    });
}

function createPreferenceWindow() {
    preferenceWindow = new BrowserWindow({
        width: 400,
        height: 300,
        title: 'Preferences',
        webPreferences: {
            nodeIntegration: true
        }
    });

    //load html into window
    preferenceWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'preferenceWindow.html'),
        protocol: 'file',
        slashes: true
    }));

    //close all windows and quit app when closed
    preferenceWindow.on('closed', function() {
        preferenceWIndow = null;
    })
}

//ipcmain handlers
ipcMain.on('item:add', function(e, item){
    mainWindow.webContents.send('item:add', item);
    addWindow.close();
});

ipcMain.on('setting:set_auto_start', function(e, item){
    preferenceWindow.close();
 });

 ipcMain.on('setting:unset_auto_start', function(e, item){
    preferenceWindow.close();
 });

 ipcMain.on('setting:cancel_settings', function(e, item){
    
    console.log('cancel settings');
    preferenceWindow.close();
 });

//create menu template
const mainMenuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Add Item',
                click() {
                    createAddWindow();
                }
            },
            {
                label: 'Clear Items',
                click(){
                    mainWindow.webContents.send('item:clear');
                }
            },
            {
                label: 'Quit',
                //shortcut to quit
                accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                click() {
                    app.quit();
                }
            }
        ]
    },
    {
        label: 'Preferences',
        click() {
            createPreferenceWindow();
        }
    },
    {
        label: 'Developer Tools',
        submenu: [
            {
                label: 'Toggle DevTools',
                accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    }
];

// if(process.env.NODE_ENV !== 'production') {
//     mainMenuTemplate.push({
//         label: 'Developer Tools',
//         submenu: [
//             {
//                 label: 'Toggle DevTools',
//                 accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
//                 click(item, focusedWindow) {
//                     focusedWindow.toggleDevTools();
//                 }
//             },
//             {
//                 role: 'reload'
//             }
//         ]
//     })
// }