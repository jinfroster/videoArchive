# videoArchive
Simple setup to view video archive uploaded by CCTV cams by FTP

Camera data to be stored in subfolders like in example CAM1 (iVideon FTP mode).
index.sh to be run by cron minutely to update index json files.
.storage_cleanup.sh to be run by cron daily/hourly to remove old files (8 days by default).
