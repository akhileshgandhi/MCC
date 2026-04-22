# Archived IEPs Implementation Summary

## Overview
This document describes the implementation of the Archived IEPs feature in the MMC Project SPFx React sidebar. The feature allows users to browse and access archived IEP documents organized by year and department, without affecting the existing Current IEP functionality.

## Implementation Date
November 27, 2025

## Files Created/Modified

### New Files Created
1. **`src/APIsServices/ArchivedIEPService.tsx`**
   - Service to fetch archived IEP documents from SharePoint Document Library
   - Interfaces for archived IEP data structures
   - Helper function to open documents in new window

### Modified Files
1. **`src/CustomComponents/MainParentComponent/CustomMetropolitanCollegeDirectory.tsx`**
   - Added import for ArchivedIEPService
   - Added state for archived IEPs data
   - Integrated archived IEPs fetching in loadAllData()
   - Added handler for archived document clicks
   - Passed archived IEPs data to Sidebar component

2. **`src/CustomComponents/OtherComponents/Sidebar.tsx`**
   - Added imports for Archive and FileText icons
   - Added props for archived IEPs data
   - Added Archived IEPs section with hierarchical tree view
   - Maintained separation from Current IEPs section

## Data Structure

### SharePoint Library Structure
```
IEP docs (Document Library)
├── ArchiveIEPs (Folder)
│   ├── MCC(2020-2021) (Year Folder)
│   │   ├── BR_BT (Department Folder)
│   │   │   └── BR_BT (2020-2021).pdf
│   │   ├── Chancellor IEP (Department Folder)
│   │   │   └── Chancellor IEP (2020-2021).pdf
│   │   └── ... (other departments)
│   │
│   └── MCC(2021-2022) (Year Folder)
│       ├── BR_BT (Department Folder)
│       │   └── BR_BT (2021-2022).pdf
│       ├── Chancellor IEP (Department Folder)
│       │   └── Chancellor IEP (2021-2022).pdf
│       └── ... (other departments)
```

### Hierarchy Interface
```typescript
interface ArchivedIEPHierarchy {
  id: string;                  // Unique identifier
  name: string;                // Display name
  year: string;                // Year (e.g., "2020-2021")
  type: 'year' | 'department' | 'document';
  children?: ArchivedIEPHierarchy[];
  documentUrl?: string;        // Only for documents
  itemCount?: number;          // Only for folders
}
```

## Features

### 1. Document Library Integration
- Fetches documents from SharePoint Document Library "IEP docs"
- Dynamically discovers year folders and department folders
- Filters to only show PDF files
- Handles errors gracefully if library or folders don't exist

### 2. Hierarchical Display
- Three-level hierarchy: Years → Departments → Documents
- Expandable/collapsible sections
- Visual indicators:
  - Archive icon for year folders (yellow/warning color)
  - Chevron icons for expand/collapse states
  - FileText icon for PDF documents (red color)
  - Department names in info color

### 3. User Interaction
- Click on year to expand/collapse departments
- Click on department to expand/collapse documents
- Click on document to open in new window/tab
- Selected document highlighting
- Mobile-responsive design

### 4. Sidebar Integration
- Appears below Current IEPs section
- Only visible on 'scorecard' page
- Separated with border-top for clear distinction
- Shows "Archived IEPs" header with Archive icon
- Displays count of archived years

## API Functions

### `getArchivedIEPs(sp, libraryName)`
Fetches all archived IEPs from SharePoint Document Library.

**Parameters:**
- `sp` - SharePoint PnP JS context
- `libraryName` - Name of document library (default: "IEP docs")

**Returns:**
- Promise<ArchivedIEPHierarchy[]> - Hierarchical array of archived IEPs

**Error Handling:**
- Returns empty array if library doesn't exist
- Logs errors to console
- Skips folders/files that can't be accessed

### `getArchivedIEPsSimplified(sp, libraryName)`
Alternative implementation with predefined structure.

**Use Case:**
- When exact folder structure is known
- For better performance with fewer API calls
- Hardcoded list of expected departments

### `openArchivedDocument(documentUrl)`
Opens archived document in new browser window.

**Parameters:**
- `documentUrl` - ServerRelativeUrl of the document

## Component Props

### Sidebar Component (Updated)
```typescript
archivedIEPs?: ArchivedIEPHierarchy[];
onArchivedDocumentClick?: (documentId: string, documentUrl: string) => void;
selectedArchivedDocument?: string | null;
```

## Styling

### Visual Design
- Consistent with existing sidebar styling
- Uses Bootstrap classes for responsiveness
- Custom hover effects for better UX
- Badge colors:
  - Secondary (gray) for archived sections
  - Info (blue) for departments
  - Primary (blue) for selected items

### Mobile Responsiveness
- Smaller text sizes on mobile
- Compact spacing
- Auto-close sidebar after document selection on mobile
- Touch-friendly click targets

## Departments Supported

Based on screenshots, the following departments are included:
1. BR_BT
2. Chancellor IEP
3. Financial & Administrative Services
4. Human Resources
5. IERT
6. Instruction
7. Legal
8. Longview
9. Maple Woods
10. President's Office Penn Valley Campus
11. Student Success & Engagement

## Current IEP vs Archived IEPs

### Current IEPs (Unchanged)
- Dynamic data from SharePoint Lists
- Shows active/current institutional effectiveness plans
- Full CRUD operations
- Interactive filtering and navigation
- Department → Sub-Department → Sub-Sub-Department hierarchy

### Archived IEPs (New)
- Read-only document access
- Organized by year and department
- Simple click-to-open functionality
- Fixed hierarchy: Year → Department → Document
- No editing or modification

## Future Enhancements

### Potential Improvements
1. **Search Functionality**
   - Add search across archived documents
   - Filter by year or department

2. **Document Preview**
   - Inline PDF preview
   - Quick view modal

3. **Download Options**
   - Batch download by year or department
   - Export to ZIP

4. **Metadata Display**
   - Show file size
   - Show last modified date
   - Show modified by user

5. **Access Control**
   - Role-based visibility
   - Department-specific filtering

6. **Performance**
   - Lazy loading of documents
   - Caching of folder structure
   - Virtual scrolling for large lists

## Testing Checklist

- [ ] Verify archived IEPs load on scorecard page
- [ ] Test expand/collapse for year folders
- [ ] Test expand/collapse for department folders
- [ ] Test document click opens in new window
- [ ] Verify correct document URL
- [ ] Test on mobile devices
- [ ] Test with no archived documents
- [ ] Test with missing library
- [ ] Verify Current IEPs still work correctly
- [ ] Test search doesn't affect archived section
- [ ] Verify visual separation from Current IEPs

## Known Limitations

1. **Library Name Assumption**
   - Currently hardcoded to "IEP docs"
   - May need configuration if name changes

2. **Folder Structure**
   - Assumes specific naming convention: MCC(YYYY-YYYY)
   - Department names must match exactly

3. **File Type**
   - Only shows PDF files
   - Other document types are filtered out

4. **Error Handling**
   - Silently fails if library doesn't exist
   - May need user notification for errors

## Migration Notes

If SharePoint library structure needs to change:
1. Update `libraryName` parameter in `loadAllData()`
2. Modify year folder regex in `getArchivedIEPs()`
3. Update department list in `getArchivedIEPsSimplified()`

## Support & Maintenance

For issues or questions:
1. Check browser console for error logs
2. Verify SharePoint library exists and is accessible
3. Check user permissions on document library
4. Validate folder structure matches expected pattern

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Nov 27, 2025 | GitHub Copilot | Initial implementation |
