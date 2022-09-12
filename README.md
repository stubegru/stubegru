![Stubegru Logo](assets/images/logo.svg)
Stay on top of things with Stubegru, the open source groupware for academic advising centers.    
     
- For **more information** what stubegru really is and which features are included see [the official website](https://stubegru.org) (in german)   
- For **technical information** take a look at the [Wiki on Github](https://github.com/stubegru/stubegru/wiki)   
- If you have any **questions or improvements**, feel free to [open an issue](https://github.com/stubegru/stubegru/issues/new)

# Installation

## Dependencies

Stubegru is based on **PHP** and **MySQL** databases. For access via a browser, a web server is also required, we recommend **Apache**. For regular execution of some scripts **Cron** is also required. All these applications must be installed for stubegru to work.

## Configure Database

- Create a MySQL Database for stubegru
- Init Database (`.dev/sql_dump`)
- Insert basic data (`.dev/demo_init.sql`)
> **WARNING** Inserting basic data via `.dev/demo_init.sql` will create a dummy user with an unsecure password and admin privileges. Make sure to delete this user in productive systems.

## Configure Cron

- The file `modules/cronjob/cronjob.php` should be called by your cron daemon once per day (e.g. every night). Make sure to call this PHP-Script with your php cli and **not** via the webserver.

## Copy and create files

- Clone this repo
- Make sure the stubegru root folder is accessible by your webserver to deliver the files to your browser
- Create `.htaccess` file (use .`htaccess.example` as template). For more information see [the wiki article](https://github.com/stubegru/stubegru/wiki/htaccess)
- You can personalize and configure stubegru with some files in [the `custom` folder](https://github.com/stubegru/stubegru/wiki/The-%22custom%22-folder)
- If you want to use the [`monitoring`](https://github.com/stubegru/stubegru/wiki/Monitoring-Module) or [`evaluation`](https://github.com/stubegru/stubegru/wiki/Evaluation-Module) module (enabled by default) you must create template files to make these modules work. 
For more information see: [wiki/survey-module](https://github.com/stubegru/stubegru/wiki/Survey-Module)

## Ready, steady, go!
- Open the project in browser and login with **user "test"** and **password "test"**

