# Quick Setup Guide: Archived IEPs Feature

## Prerequisites
Before the feature will work, ensure you have:

1. **SharePoint Document Library**: "IEP docs" (or configure a different name)
2. **Folder Structure** in the library:
   ```
   IEP docs/
   ├── ArchiveIEPs/
   │   ├── MCC(2020-2021)/
   │   │   ├── BR_BT/
   │   │   │   └── BR_BT (2021-2022).pdf
   │   │   ├── Chancellor IEP/
   │   │   │   └── Chancellor IEP (2021-2022).pdf
   │   │   └── [other departments]/
   │   │
   │   └── MCC(2021-2022)/
   │       └── [same department structure]
   ```

3. **Permissions**: Ensure users have Read access to the document library

## How to Use (End User)

1. **Navigate to Scorecards Page**
   - Click on the IEPs/Scorecards icon in the left navigation

2. **View Archived IEPs**
   - Scroll down in the sidebar below the Current IEPs section
   - Look for the "Archived IEPs" header with an archive icon

3. **Browse Archives**
   - Click on a year folder (e.g., "MCC(2020-2021)") to expand it
   - Click on a department to see the documents
   - Click on a document name to open it in a new tab

4. **Navigate Back**
   - Click the expanded year/department again to collapse
   - Use browser back button after viewing documents

## Configuration Options

### Change Library Name
If your document library has a different name, update this line in `CustomMetropolitanCollegeDirectory.tsx`:

```typescript
// Line ~212 in loadAllData()
getArchivedIEPs(sp, "YOUR_LIBRARY_NAME") // Change "IEP docs" to your library name
```

### Customize Department List
If you want to use the simplified approach with a predefined list, replace the function call:

```typescript
// In loadAllData(), replace:
getArchivedIEPs(sp, "IEP docs")

// With:
getArchivedIEPsSimplified(sp, "IEP docs")
```

Then update the department list in `ArchivedIEPService.tsx`:

```typescript
const departmentNames = [
  "BR_BT",
  "Chancellor IEP",
  // Add your departments here
];
```

## Troubleshooting

### Archived IEPs Not Showing

**Problem**: The "Archived IEPs" section doesn't appear

**Solutions**:
1. Check if you're on the scorecard page (not dashboard/users/settings)
2. Verify the document library exists and is named correctly
3. Check browser console for error messages
4. Ensure the folder structure matches the expected pattern

### Documents Not Opening

**Problem**: Clicking a document doesn't open anything

**Solutions**:
1. Check browser pop-up blocker settings
2. Verify document URLs are correct (check console logs)
3. Ensure user has permissions to access documents
4. Try right-click → "Open in new tab" as a workaround

### Folders Not Expanding

**Problem**: Clicking year or department doesn't expand

**Solutions**:
1. Check if `onToggleSection` is working for Current IEPs
2. Verify `expandedSections` state is updating (React DevTools)
3. Clear browser cache and reload
4. Check for JavaScript errors in console

### Wrong Documents Showing

**Problem**: Documents from wrong year/department are displayed

**Solutions**:
1. Verify folder structure matches exactly: `MCC(YYYY-YYYY)/DepartmentName/Document.pdf`
2. Check for duplicate folder names
3. Ensure year format is correct (with parentheses)
4. Review console logs for parsing errors

## Development Tips

### Debugging
Add console logs to see what's being loaded:

```typescript
// In CustomMetropolitanCollegeDirectory.tsx, after setArchivedIEPs()
console.log('Archived IEPs loaded:', archivedData);

// In Sidebar.tsx, at the top of component
console.log('Sidebar archivedIEPs prop:', archivedIEPs);
```

### Testing with Mock Data
For testing without SharePoint, add mock data:

```typescript
// In loadAllData(), replace the API call with:
const mockArchived: ArchivedIEPHierarchy[] = [
  {
    id: 'archive-year-2020-2021',
    name: 'MCC(2020-2021)',
    year: '2020-2021',
    type: 'year',
    children: [
      {
        id: 'archive-dept-2020-2021-BR_BT',
        name: 'BR_BT',
        year: '2020-2021',
        type: 'department',
        itemCount: 1,
        children: [
          {
            id: 'archive-doc-2020-2021-BR_BT-test.pdf',
            name: 'BR_BT (2020-2021)',
            year: '2020-2021',
            type: 'document',
            documentUrl: '/sites/yoursite/IEP docs/MCC(2020-2021)/BR_BT/BR_BT (2020-2021).pdf'
          }
        ]
      }
    ]
  }
];
setArchivedIEPs(mockArchived);
```

## Performance Considerations

### For Large Archives
If you have many years/departments:

1. **Enable Lazy Loading**
   - Only fetch folders when expanded
   - Currently fetches all at once

2. **Add Pagination**
   - Limit years shown initially
   - "Load more" button for older years

3. **Cache Results**
   - Store in localStorage
   - Refresh periodically or on user request

### API Optimization
Current implementation makes multiple API calls. To reduce:

1. Use `getArchivedIEPsSimplified()` if structure is known
2. Implement server-side aggregation if possible
3. Consider batch requests

## Maintenance

### Adding New Years
When a new academic year is archived:
1. Create new year folder in SharePoint: `MCC(YYYY-YYYY)`
2. Add department folders within it
3. Upload PDF documents
4. Feature will automatically detect and display new year

### Updating Documents
To update an archived document:
1. Navigate to SharePoint library
2. Replace the PDF file
3. Refresh the application (hard refresh: Ctrl+F5)

### Removing Old Archives
To hide old years:
1. Option A: Move folders to a different library
2. Option B: Add year filter in `getArchivedIEPs()`:
   ```typescript
   // Skip years older than 5 years
   const currentYear = new Date().getFullYear();
   const yearNum = parseInt(year.split('-')[0]);
   if (currentYear - yearNum > 5) continue;
   ```

## Support

For technical support:
1. Check this guide first
2. Review `docs/Archived-IEPs-Implementation-Summary.md`
3. Check console for error messages
4. Contact your SharePoint administrator for library/permission issues
5. Contact developer for code-related issues

## Quick Reference

| Action | Location | File |
|--------|----------|------|
| Change library name | `loadAllData()` | CustomMetropolitanCollegeDirectory.tsx |
| Modify folder structure | `getArchivedIEPs()` | ArchivedIEPService.tsx |
| Adjust styling | Sidebar component | Sidebar.tsx |
| Add/remove departments | `departmentNames` array | ArchivedIEPService.tsx (simplified version) |
