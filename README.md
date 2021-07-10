# videoArchive
Simple setup to view video archive uploaded by Ivideon CCTV cams by FTP
![ivideon-screen](https://user-images.githubusercontent.com/6553300/122643598-4d86ce80-d119-11eb-91eb-2cf7d15cb52a.png)

Click on date to load it's cache. Mouse over green timeline zones to view photos. Click on yellow timeline zones to view videos.
Camera data to be stored in subfolders like in example CAM1 (Ivideon FTP mode).

index.sh to be run by cron minutely to update index json files.

.storage_cleanup.sh to be run by cron daily/hourly to remove old files (8 days by default).
