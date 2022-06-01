const StubegruModuleLoader = {

    /**
     * List with all module's names that are allready laoded
     */
    loadedModulesNames: [],
    /**
     * List with all module's names that are requested by the current view
     */
    allModulesNames: [],
    /**
     * Unordered Queue with all modules (and it's data) that should be loaded and are not staged for loading yet
     * Modules' names as keys
     */
    waitForLoad: {},
    overallResolve: undefined,


    /**
     * Load all modules that are necccessary for this view. Dependency order will be preserved!
     * USE ONLY THIS METHOD FROM OUTSIDE THIS SCRIPT!
     */
    loadStubegruModules: async function () {
        await this.initModulesLists();
        this.checkForDependencyProblems();
        await this.organizeModuleLoading();
    },

    /**
     * Organize loading of all modules in waitForLoad list in correct dependency order, resolves when all modules are loaded
     */
    organizeModuleLoading: async function () {
        return new Promise(function (resolve, reject) {
            StubegruModuleLoader.overallResolve = resolve;
            StubegruModuleLoader.tryToLoadModules();
        });
    },

    /**
     * Checks if there are any modules that could be loaded (means they have no not yet loaded dependencies)
     * This function is allways called when a module finished loading
     */
    tryToLoadModules: async function () {
        for (const moduleName in this.waitForLoad) { //For all modules that are not yet loaded
            let moduleData = this.waitForLoad[moduleName];
            let dependecyBlock = false;
            if (moduleData.dependencies && moduleData.dependencies.blocking) { //if module has blocking dependencies
                for (const dep of moduleData.dependencies.blocking) { //for all blocking dependencies
                    if (this.loadedModulesNames.indexOf(dep) == -1) { //if there's a dependency that is not yet loaded
                        dependecyBlock = true;
                    }
                }
            }
            if (dependecyBlock == false) {
                delete this.waitForLoad[moduleName]; //remove this module from waitForLoad Queue
                this.loadModuleFiles(moduleData).then(() => { //Load modules files now and call tryToLoadModules when finished
                    StubegruModuleLoader.loadedModulesNames.push(moduleName); //Add module to loaded modules list
                    StubegruModuleLoader.tryToLoadModules();
                });
            }
        }


        //check if all modules are loaded now
        if (this.loadedModulesNames.length >= this.allModulesNames.length) {
            if (this.overallResolve) {
                console.log("Finished loading all modules!");
                this.overallResolve();
            }
        }
    },

    /**
     * Load module data from module.json
     * @param {string} moduleName 
     * @returns module Data
     */
    getModuleData: async function (moduleName) {
        try {
            let resp = await fetch(`${stubegru.constants.BASE_URL}/modules/${moduleName}/module.json`);
            moduleData = await resp.json();
            return moduleData;
        } catch (e) {
            console.error(`Can't laod Stubegru Module '${moduleName}': module.json was not found`);
            return;
        }
    },

    //Go through html and search for all <stubegruModule> tags. Add the modules to lists
    initModulesLists: async function () {
        for (let moduleElement of $("stubegruModule")) {
            const moduleName = $(moduleElement).attr("data-name");
            this.allModulesNames.push(moduleName);

            //load module data
            let moduleData = await this.getModuleData(moduleName);
            this.waitForLoad[moduleName] = moduleData;
        }
    },

    checkForDependencyProblems: function () {
        for (const moduleName of this.allModulesNames) {
            this.missingDependencyCheck(moduleName).catch(console.error);
            this.dependencyCircleCheck(moduleName, [moduleName]);
        }
    },

    missingDependencyCheck: async function (moduleName) {
        const moduleData = this.waitForLoad[moduleName];

        //Check if blocking dependencies are present in the current view
        if (moduleData.dependencies && moduleData.dependencies.blocking) {
            for (const dep of moduleData.dependencies.blocking) {
                if (this.allModulesNames.indexOf(dep) == -1) {
                    throw new Error(`Module '${moduleName}' has blocking dependency '${dep}'. But this module is not present in the current view.\nPlease include it in the view with: <stubegruModule data-name="${dep}"></stubegruModule>`);
                }
            }
        }

        //Check if NON-blocking dependencies are present in the current view
        if (moduleData.dependencies && moduleData.dependencies.nonBlocking) {
            for (const dep of moduleData.dependencies.nonBlocking) {
                if (this.allModulesNames.indexOf(dep) == -1) {
                    throw new Error(`Module '${moduleName}' has non-blocking dependency '${dep}'. But this module is not present in the current view.\nPlease include it in the view with: <stubegruModule data-name="${dep}"></stubegruModule>`);
                }
            }
        }

        //Check if backend dependencies are present in the modules folder (no matter if they are present in the current view)
        if (moduleData.dependencies && moduleData.dependencies.backend) {
            for (const dep of moduleData.dependencies.backend) {
                if (await this.getModuleData(dep) == undefined) {
                    throw new Error(`Module '${moduleName}' has backend dependency '${dep}'. But this module is not present in the modules folder.\nPlease install '${dep}' and add it's files to the modules folder.`);
                }
            }
        }
    },

    dependencyCircleCheck: function (moduleName, dependencyList) {
        const moduleData = this.waitForLoad[moduleName];
        if (moduleData.dependencies && moduleData.dependencies.blocking) {
            for (const dep of moduleData.dependencies.blocking) {
                if (dependencyList.indexOf(dep) > -1) {
                    throw new Error(`Module '${moduleName}' has dependency circle with at least '${dep}'.`);
                }
                let depListCopy = JSON.parse(JSON.stringify(dependencyList)); //do a real copy (not a refernce copy of the dependency list)
                this.dependencyCircleCheck(dep, depListCopy); //Check  dependecy's dependencies recursive :-)
            }
        }
    },

    loadModuleFiles: async function (moduleData) {
        const moduleName = moduleData.name;
        const moduleSelector = `stubegruModule[data-name='${moduleName}']`;

        for (let htmlFileName of moduleData.html) {
            const htmlPath = `${stubegru.constants.BASE_URL}/modules/${moduleName}/${htmlFileName}`;
            await this.loadHtml(htmlPath, moduleSelector);
        }

        for (let cssFileName of moduleData.css) {
            const cssPath = `${stubegru.constants.BASE_URL}/modules/${moduleName}/${cssFileName}`;
            await this.loadCss(cssPath);
        }

        for (let jsFileName of moduleData.js) {
            const jsPath = `${stubegru.constants.BASE_URL}/modules/${moduleName}/${jsFileName}`;
            await this.loadJs(jsPath);
        }
    },

    //Load remote HTML and append to module's DOM element
    loadHtml: async function (path, selector) {
        let resp = await fetch(`${path}?v=${stubegru.constants.APPLICATION_VERSION}`);
        let data = await resp.text();
        $(selector).append(data);
    },

    //Load CSS and add to page
    loadCss: async function (path) {
        return new Promise(function (resolve, reject) {
            let cssElem = document.createElement("link");
            cssElem.href = `${path}?v=${stubegru.constants.APPLICATION_VERSION}`;
            cssElem.rel = "stylesheet";
            cssElem.addEventListener('load', resolve);
            document.head.appendChild(cssElem);
        });
    },

    //Load script and execute it
    loadJs: async function (path) {
        return new Promise(function (resolve, reject) {
            let jsElem = document.createElement("script");
            jsElem.src = `${path}?v=${stubegru.constants.APPLICATION_VERSION}`;
            jsElem.addEventListener('load', resolve);
            document.body.appendChild(jsElem);
        });
    }

}


