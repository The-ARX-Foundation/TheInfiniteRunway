---
Date Created: 2026-03-11 00:15
Last Updated: 2026-03-11 00:15
tags:
  - Area
Index: 
Topic:
  - "[[Housekeeping]]"
Status: Unweathered
Published: false
---
---
# Initial Overall (2025-07-06)
## Mounted
```
Filesystem      Size  Used Avail Use% Mounted on
udev             16G     0   16G   0% /dev
tmpfs           3.2G  2.2M  3.2G   1% /run
/dev/nvme1n1p5   33G   29G  2.4G  93% /
tmpfs            16G   15M   16G   1% /dev/shm
tmpfs           5.0M   20K  5.0M   1% /run/lock
/dev/nvme1n1p9  144G  121G   15G  90% /home
/dev/nvme1n1p8  2.0G  152K  1.9G   1% /tmp
/dev/nvme1n1p6   20G   12G  7.6G  61% /var
/dev/nvme1n1p1   96M   33M   64M  34% /boot/efi
/dev/nvme0n1p2  1.9T  1.4T  482G  75% /mnt/secondary
tmpfs           3.2G  172K  3.2G   1% /run/user/1000
```

## Unmounted


# System Disk
## Microsoft Dual Boot
We don't talk about bruno...

## Linux System Partition
Keep for purely system, ideally move out non system installs
Move node//software stuff to apps partition? Or perhaps just the home partition as is, move to apps dir.
	`/apps`
## Home Partition


# Secondary Disk
## Initial
```
elryan@Pensieve:~/SecondaryDisk$ ls
'$RECYCLE.BIN'           Downloads        Software
 Alchemy                 Entertainment    SteamLibrary
 AppData                 Evocation       'System Volume Information'
 Artificing              Games            testfile.txt
 Backup                  Illusion         Transmutation
'Creative Cloud Files'   Memories         Users
 Divination             'Program Files'   WindowsApps
 Documents               Recovery         Zettelkasten.lnk
```

## Thoughts
I had initially sorted it by the type of work being done but thinking I might set up s.t. its symlinked by type of work within each workstation; i.e. on the secondary disk have it be as is with the different types of work:

[[Whimsical Endeavor Types]]

But on the home directory have it seperated into endeavors; i.e. hopefullyabysmal, [[Elryan The Explorer]], the arx foundation, and more as needed. To enable this could it be possible to have them all in the work type folders and have metadata tagging them as under which work type they go to? from there symlinking to the folders on the folders on each workflow respectively? Or perhaps diverge from that for something more optimal//project based but have the storage itself be all in one directory?

If cant do natively with symlink and scripting looking into [[TagStudio]]