# Install mongoDB

1. **Import the public key used by the package management system**  
The Ubuntu package management tools (i.e. dpkg and apt) ensure package consistency and authenticity by requiring that distributors sign packages with GPG keys. Issue the following command to import the MongoDB public GPG Key:

  ```
  sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv EA312927
  ```

2. **Create a list file for MongoDB**  
Create the `/etc/apt/sources.list.d/mongodb-org-3.2.list` list file using the command appropriate for your version of Ubuntu:

  ```
  echo "deb http://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.2.list
  ```

3. **Reload local package database.**  
Issue the following command to reload the local package database:

  ```
  sudo apt-get update
  ```

4. **Install the MongoDB packages**  
Install the latest stable version of MongoDB.

  ```
  sudo apt-get install -y mongodb-org
  ```

5. **(Ubuntu 16.04-only) Create systemd service file**  

  > Follow this step ONLY if you are running Ubuntu 16.04

  Create a new file at **/lib/systemd/system/mongod.service** with the following contents:

  ```
  [Unit]
  Description=High-performance, schema-free document-oriented database
  After=network.target
  Documentation=https://docs.mongodb.org/manual

  [Service]
  User=mongodb
  Group=mongodb
  ExecStart=/usr/bin/mongod --quiet --config /etc/mongod.conf

  [Install]
  WantedBy=multi-user.target
  ```

6. **Run MongoDB Community Edition**  
The MongoDB instance stores its data files in `/var/lib/mongodb` and its log files in `/var/log/mongodb` by default, and runs using the mongodb user account. You can specify alternate log and data file directories in `/etc/mongod.conf`. See **systemLog.path** and **storage.dbPath** for additional information. [Configuration Options](https://docs.mongodb.com/manual/reference/configuration-options/)

  If you change the user that runs the MongoDB process, you must modify the access control rights to the `/var/lib/mongodb` and `/var/log/mongodb` directories to give this user access to these directories.

#### mongod.conf template

```
# mongod.conf

# for documentation of all options, see:
# http://docs.mongodb.org/manual/reference/configuration-options/

# Where and how to store data.
storage:
  dbPath: /data/mongodb
  journal:
    enabled: true

#  engine:
#  mmapv1:
#  wiredTiger:

# where to write logging data.
systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log

# network interfaces
net:
  port: 27017
  bindIp: 127.0.0.1

#processManagement:

#security:

#operationProfiling:

#replication:

#sharding:

## Enterprise-Only Options:

#auditLog:

#snmp:
```

# Use MongoDB

1. **Start MongoDB**  
Issue the following command to start mongod:

  ```
  sudo service mongod start
  ```

2. **Check MongoDB status**  
Issue the following command to start mongod:

  ```
  sudo service mongod status
  ```

3. **Verify that MongoDB has started successfully**  
Verify that the mongod process has started successfully by checking the contents of the log file at `/var/log/mongodb/mongod.log` for a line reading

  ```
  cat /var/log/mongodb/mongod.log
  ```

  ```
  [initandlisten] waiting for connections on port <port>
  ```

  where **<port>** is the port configured in `/etc/mongod.conf`, **27017** by default.

4. **Stop MongoDB**  
As needed, you can stop the mongod process by issuing the following command:

  ```
  sudo service mongod stop
  ```

5. **Restart MongoDB**  
Issue the following command to restart mongod:

  ```
  sudo service mongod restart
  ```

6. **Disable Transparent Huge Pages (THP) warning**  
To disable the THP warning in the log file `/var/log/mongodb/mongod.log`, issue the following commands:

  1. **Check the status of the files by echoing them:**

    ```
    cat /sys/kernel/mm/transparent_hugepage/defrag
    cat /sys/kernel/mm/transparent_hugepage/enabled
    ```

  2. **Remove the log file by issuing the following command:**

    ```
    sudo rm /var/log/mongodb/mongod.log
    ```

  3. **Disable the THP**

    ```
    echo never | sudo tee /sys/kernel/mm/transparent_hugepage/defrag
    echo never | sudo tee /sys/kernel/mm/transparent_hugepage/enabled
    ```

  4. **Launch MongoDB at startup (macOS)**

  ```
  ln -sfv /usr/local/opt/mongodb/*.plist ~/Library/LaunchAgents
  launchctl load ~/Library/LaunchAgents/homebrew.mxcl.mongodb.plist
  ```

  Replace `load` by `unload` to disable launching MongoDB at startup 

7. **Uninstall MongoDB**  
To completely remove MongoDB from a system, you must remove the MongoDB applications themselves, the configuration files, and any directories containing data and logs. The following section guides you through the necessary steps.

  > This process will completely remove MongoDB, its configuration, and all databases. This process is not reversible, so ensure that all of your configuration and data is backed up before proceeding.

  1. **Stop MongoDB**  
  Stop the mongod process by issuing the following command:

    ```
    sudo service mongod stop
    ```

  2. **Remove Packages**  
  Remove any MongoDB packages that you had previously installed.

    ```
    sudo apt-get --purge autoremove mongodb-org*
    ```

  3. **Remove Data Directories**  
  Remove MongoDB databases and log files.

    ```
    sudo rm -r /var/log/mongodb (or <path_to_log_file>)
    sudo rm -r /var/lib/mongodb (or <path_to_data_file>)
    ```
