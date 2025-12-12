# Adding CO-AUG Dashboard as Git Submodule

I've removed the manual entry from `.gitmodules`. Now run this command to properly add it:

```bash
cd "/Users/joebowers/Library/CloudStorage/Dropbox/Caveman Creative/THE WELL_Digital Assets/The Well Code/solvet-global"

# Add the submodule (this will clone it and register it properly)
git submodule add https://github.com/node-dojo/co-aug-dashboard.git co-aug-dashboard
```

This command will:
1. Clone the dashboard repository into `co-aug-dashboard/`
2. Add the entry to `.gitmodules` automatically
3. Register it in `.git/config` 
4. Stage the submodule for commit

After running this command, the dashboard will be available at `solvet-global/co-aug-dashboard/` and will be tracked as a submodule.

**Note:** If you get an error that the directory already exists, remove it first:
```bash
rm -rf co-aug-dashboard
git submodule add https://github.com/node-dojo/co-aug-dashboard.git co-aug-dashboard
```
