#/bin/bash

find ./CAM_NAME -mtime +7 -exec rm {} \;
find ./CAM_NAME -type d -empty -delete
