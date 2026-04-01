---
Date Created: "2025-06-04 11:15"
Last Updated: "2025-06-04 11:15"
tags:
  - Resource
Index:
  - "[[The Operator]]"
Topic:
  - "[[Linux]]"
  - "[[Infrastructure]]"
Status: Unweathered
Published: false
---
---

Moved to linux from windows, initial setup was as such:

```
NAME        MAJ:MIN RM   SIZE RO TYPE MOUNTPOINTS
sda           8:0    0 931.5G  0 disk 
└─sda1        8:1    0 931.5G  0 part 
sdb           8:16   0   3.6T  0 disk 
├─sdb1        8:17   0    16M  0 part 
└─sdb2        8:18   0   3.6T  0 part /media/elryan/The Arxives
sdc           8:32   1 114.6G  0 disk 
└─sdc1        8:33   1 114.6G  0 part /media/elryan/461E-5C0D
nvme0n1     259:0    0   1.8T  0 disk 
├─nvme0n1p1 259:1    0    16M  0 part 
└─nvme0n1p2 259:2    0   1.8T  0 part /media/elryan/Secondary Disk
nvme1n1     259:3    0 465.8G  0 disk 
├─nvme1n1p1 259:4    0   100M  0 part /boot/efi
├─nvme1n1p2 259:5    0    16M  0 part 
├─nvme1n1p3 259:6    0 260.1G  0 part 
├─nvme1n1p4 259:7    0   505M  0 part 
├─nvme1n1p5 259:8    0  33.2G  0 part /
├─nvme1n1p6 259:9    0  20.4G  0 part /var
├─nvme1n1p7 259:10   0   2.9G  0 part [SWAP]
├─nvme1n1p8 259:11   0   2.1G  0 part /tmp
└─nvme1n1p9 259:12   0 146.5G  0 part /home
```

Thinking I'm going to keep the mounting as is, move contents of home dir to the other drive except for anything I deem worthy of being on the main drive (installed shit, games, etc.) then symlinking over from  the secondary drive into the home directory.

At that point will likely set up the tertiary and quad drives to automatically backup specific directories from the main drive; add some kind of version control if I can. 

[[Storage Setup]]

---

## Related

- [[NAS Full Filesystem]] — Full ops playbook for version-controlled home filesystem, backup, and recovery
- [[Swapfile expansion]] — Expanding swap when `/` partition runs tight
- [[Cuda Toolkit Installation]] — Needed to redirect APT cache to `/home` due to `/var` space constraints
- [[Gnome Freezing on Workspace Selection Mode]] — Considering switching to Hyprland/Arch, which would require migrating content off system disc first