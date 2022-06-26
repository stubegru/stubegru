# stubegru
Stay on top of things with Stubegru, the open source groupware for academic advising centers.

# Short installation guide

- Clone the repo
- Install Apache, PHP and MySQL (e.g with XAMPP)
    - for detailed instructions on **archlinux** see: https://gist.github.com/superjojo140/18e250786d977b27571124f81bba5018
    - Link your webserver's document root with your project folder:

    ```shell
    ln -s /path/to/project/ /path/to/document/root
    ln -s /home/username/projects/stubegru/  /srv/http/stubegru #example for apache on archlinux
    ```

    - Create MySQL Database

    ```sql
    CREATE DATABASE `db_name`;
    GRANT ALL PRIVILEGES ON `db_name` . * TO 'username'@'localhost';
    ```

- Init Database (`.dev/sql_dump`)
- Insert basic data (`.dev/demo_init.sql`)
- Create `.htaccess` file (use .`htaccess.example` as template)
- Create `.version` file with random version number (e.g. `version1`)
- Open the project in browser and login with user "test" and password "test"
