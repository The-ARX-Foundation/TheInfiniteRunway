---
Date Created: "2025-06-04 11:46"
Last Updated: "2025-06-04 11:46"
tags:
  - Resource
Index:
  - "[[The Operator]]"
Topic:
  - "[[Linux]]"
Status: Unweathered
Published: false
---
---

I seem to not be able to copy paste any files into the secondary drive; I am set as the owner and I have put in my password though... "Could not paste files; permissions do not allow pasting files in this directory"

# GPT
Thanks for catching that early — let's fix it before setting up anything else.

### 🔍 Here's what’s probably happening:

Your secondary disk is auto-mounted under `/media/elryan/Secondary Disk`, **but with restrictive permissions** — likely because it's formatted as **NTFS**, and Linux is mounting it **read-only or without proper ownership**.

Let’s solve it step by step:

---

## ✅ Step 1: Confirm Filesystem Type

Run:

```bash
lsblk -f
```

Look for `/dev/nvme0n1p2` and note the **FSTYPE** (likely `ntfs` or `exfat`).

---

## ✅ Step 2: Check Mount Options

Run:

```bash
mount | grep "Secondary Disk"
```

Look for something like:

```
/dev/nvme0n1p2 on /media/elryan/Secondary Disk type ntfs ...
```

If you see `ro` (read-only), or no `uid=1000` option, that's the issue.

---

```

elryan@Pensieve:~$ lsblk -f
NAME FSTYPE FSVER LABEL UUID                                 FSAVAIL FSUSE% MOUNTPOINTS
sda                                                                         
├─sda1
│                                                                           
└─sda2
     ntfs         The Arxives
                        5676D58876D5696F                                    
sdb                                                                         
└─sdb1
     ntfs         Wasteland
                        7EBE3F6DBE3F1CD9                                    
sdc                                                                         
└─sdc1
     exfat  1.0         461E-5C0D                             110.8G     3% /media/elryan/461E-5C0D
nvme0n1
                                                                            
├─nvme0n1p1
│                                                                           
└─nvme0n1p2
     ntfs         Secondary Disk
                        6AF24060F240329D                      531.9G    71% /media/elryan/Secondary Disk
nvme1n1
                                                                            
├─nvme1n1p1
│    vfat   FAT32       5828-67DC                              63.4M    34% /boot/efi
├─nvme1n1p2
│                                                                           
├─nvme1n1p3
│    ntfs         System Disk
│                       22EA2901EA28D339                                    
├─nvme1n1p4
│    ntfs               2EECAB65ECAB25D5                                    
├─nvme1n1p5
│    ext4   1.0         a2095040-9e25-402b-a7f3-3c85f31485b3   10.1G    64% /
├─nvme1n1p6
│    ext4   1.0         10aef5a5-fda7-47ce-abd5-992e39a4c086   11.3G    38% /var
├─nvme1n1p7
│    swap   1           155bbdb5-7270-425a-baaf-d3b52798400a                [SWAP]
├─nvme1n1p8
│    ext4   1.0         982503e0-a604-43cf-8d6b-d5567465fbdc    1.9G     0% /tmp
└─nvme1n1p9
     ext4   1.0         ca53154e-1210-426f-8ebc-36acf461233b   39.7G    67% /home

```

and 

```

elryan@Pensieve:~$ mount | grep "Secondary Disk"
/dev/nvme0n1p2 on /media/elryan/Secondary Disk type fuseblk (ro,nosuid,nodev,relatime,user_id=0,group_id=0,default_permissions,allow_other,blksize=4096,uhelper=udisks2)

```


so the above is the case, but reccomend double checking before doing the next bit.

---
## ✅ Step 3: Unmount and Remount with Correct Options

Let’s manually mount it with your user permissions:

```bash
sudo umount "/media/elryan/Secondary Disk" && sudo mkdir -p /mnt/secondary && sudo mount -t ntfs-3g -o uid=1000,gid=1000,umask=022 /dev/nvme0n1p2 /mnt/secondary
```

If you receive the following you need to [[fully shut down windows]]:
```bash
The disk contains an unclean file system (0, 0).
Metadata kept in Windows cache, refused to mount.
Falling back to read-only mount because the NTFS partition is in an
unsafe state. Please resume and shutdown Windows fully (no hibernation
or fast restarting.)
Could not mount read-write, trying read-only
```

Now try writing:

```bash
touch /mnt/secondary/testfile.txt
```

If that works, you're golden ✅

---

## ✅ Step 4: Make It Permanent (fstab)

Get UUID:

```bash
sudo blkid /dev/nvme0n1p2
```

(in my case it was `UUID=6AF24060F240329D`)

Copy the UUID, then:

```bash
sudo nano /etc/fstab
```

Add:

```fstab
UUID=XXXX-YYYY  /mnt/secondary  ntfs-3g  uid=1000,gid=1000,umask=022  0  0
```

(Change `XXXX-YYYY` to your real UUID.)
	Ex for me: `UUID=6AF24060F240329D  /mnt/secondary  ntfs-3g  uid=1000,gid=1000,umask=022  0  0`

Then save and apply:

```bash
sudo mount -a
```

---

## ✅ Step 5: Optional — Create Symlinks in Home

```bash
ln -s /mnt/secondary ~/SecondaryDisk
```

---

Let me know the filesystem if it's **not NTFS**, and I’ll adjust the instructions. We’ll get it writable for sure.