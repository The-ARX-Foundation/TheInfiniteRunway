---
Date Created: "2025-06-04 11:34"
Last Updated: "2025-06-04 11:34"
tags:
  - Area
Index: 
Topic: 
Status: Unweathered
Published: false
---
---

As I have multiple vaults within each other that have their own structures mimicking my own (see [[Vault Setup]]) I think the best course of action for interoperability will be to symlink the non-content folders (i.e. path, index, source material)

Then again if I just have the tags set correctly it wont even matter....

We shall see. 

I just need to migrate over to just using path files and index's as intended, start marking things better and have index files so I stop using the filesystem as a crutch.

To do this perhaps write a `directories2path-n-index` script?

See:
[[0 - Housekeeping/Path vs Index|Path vs Index]]
[[6 - Elryan The Explorer/The Capitalist/The 60 Day Runway/0 - Housekeeping/The Note-taker's Housekeeping Bots|The Note-taker's Housekeeping Bots]]

The symlinking could be helpful though; like when I was looking for that note I had like 3 of the same note!! 

New setup idea: opposite.

Any duplicate file symlink from main vault into that vaults folder, symlink contents of vault back to main vault for access however. Reduces redundancy.
Perhaps have folders within the paths, indexes, source material, etc. just for each vault? take out all other folders and convert to paths and indexes (tags for PARA shit)

## TODO

- [ ] Decide on symlink strategy for nested vaults vs. tags-only approach
	- [ ] Option A: Symlink non-content folders (path, index, source material) across vaults
	- [ ] Option B: Rely on tags for cross-vault discoverability
	- [ ] Option C (reverse): Symlink duplicates from main vault into sub-vaults, symlink sub-vault content back to main
- [ ] Deduplicate notes that exist in multiple vaults
- [ ] Consider vault-specific subfolders within paths/indexes/source material
- [ ] Migrate fully to Paths and Indexes, stop using filesystem as a crutch
