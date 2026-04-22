# IEP Discussion SharePoint List Structure

## List Name: `IEPDiscussions`

### Description
This list stores discussion comments and replies for IEP (Institutional Effectiveness Plans). It supports threaded conversations with parent-child relationships and user mentions. Discussions are filtered by department so users only see their own department's discussions.

---

## Column Definitions

| Column Name | Internal Name | Type | Required | Description |
|-------------|---------------|------|----------|-------------|
| **Title** | Title | Single line of text | No | Auto-generated or optional title |
| **Comment** | Comment | Multiple lines of text (Plain text) | Yes | The discussion comment or reply text |
| **IEP** | IEP | Lookup | Yes | Lookup to IEPs list (shows: Title) |
| **Department** | Department | Lookup | Yes | Lookup to Departments list (shows: DepartmentName) |
| **Parent Comment** | ParentCommentId | Number | No | ID of parent comment (null for top-level comments) |
| **Mentioned Users** | MentionedUsers | Person or Group (Multiple) | No | Users mentioned with @ in the comment |
| **Created** | Created | Date and Time | Auto | Auto-populated creation timestamp |
| **Modified** | Modified | Date and Time | Auto | Auto-populated modification timestamp |
| **Author** | Author | Person or Group | Auto | Auto-populated comment author |

---

## Detailed Column Specifications

### 1. Title (Single line of text)
- **Required**: No
- **Max Length**: 255 characters
- **Default**: Can be left empty or auto-generated

### 2. Comment (Multiple lines of text)
- **Required**: Yes
- **Type**: Plain text (or Enhanced rich text if needed)
- **Number of lines**: 6
- **Description**: The actual comment or reply content

### 3. IEP (Lookup)
- **Required**: Yes
- **Get information from**: IEPs (list)
- **In this column**: Title (or ID)
- **Allow multiple values**: No
- **Enforce relationship behavior**: Cascade Delete

### 4. Department (Lookup)
- **Required**: Yes
- **Get information from**: Departments (list)
- **In this column**: DepartmentName
- **Allow multiple values**: No
- **Enforce relationship behavior**: Restrict Delete

### 5. ParentCommentId (Number)
- **Required**: No
- **Min/Max**: No limits
- **Decimal places**: 0
- **Description**: Used to create threaded discussions. Top-level comments have null/empty value. Replies store the ID of their parent comment.

### 6. MentionedUsers (Person or Group)
- **Required**: No
- **Allow multiple selections**: Yes
- **Allow selection of**: People Only
- **Choose from**: All Users
- **Show Field**: Name (with presence)

### 7. Created (Date and Time)
- **Type**: Date and Time
- **Auto-populated**: Yes
- **Description**: Automatically set when item is created

### 8. Modified (Date and Time)
- **Type**: Date and Time
- **Auto-populated**: Yes
- **Description**: Automatically updated when item is modified

### 9. Author (Person or Group)
- **Auto-populated**: Yes
- **Description**: Automatically set to the user who created the comment

---

## PowerShell Script to Create the List

```powershell
# Connect to SharePoint
Connect-PnPOnline -Url "https://yourtenant.sharepoint.com/sites/yoursite" -Interactive

# Create the list
New-PnPList -Title "IEPDiscussions" -Template GenericList -OnQuickLaunch

# Add Comment column (Multiple lines)
Add-PnPField -List "IEPDiscussions" -DisplayName "Comment" -InternalName "Comment" -Type Note -Required -AddToDefaultView

# Add IEP Lookup column
Add-PnPField -List "IEPDiscussions" -DisplayName "IEP" -InternalName "IEP" -Type Lookup -Required -AddToDefaultView `
  -LookupList "IEPs" -LookupField "Title"

# Add Department Lookup column
Add-PnPField -List "IEPDiscussions" -DisplayName "Department" -InternalName "Department" -Type Lookup -Required -AddToDefaultView `
  -LookupList "Departments" -LookupField "DepartmentName"

# Add ParentCommentId column (Number)
Add-PnPField -List "IEPDiscussions" -DisplayName "Parent Comment" -InternalName "ParentCommentId" -Type Number -AddToDefaultView

# Add MentionedUsers column (Person or Group, Multiple)
Add-PnPFieldFromXml -List "IEPDiscussions" -FieldXml @"
<Field Type='UserMulti' DisplayName='Mentioned Users' Name='MentionedUsers' 
       Mult='TRUE' UserSelectionMode='PeopleOnly' UserSelectionScope='0' />
"@

Write-Host "IEPDiscussions list created successfully!" -ForegroundColor Green
```

---

## Manual List Creation Steps

### Step 1: Create the List
1. Go to your SharePoint site
2. Click **Site Contents** > **New** > **List**
3. Choose **Blank list**
4. Name: `IEPDiscussions`
5. Click **Create**

### Step 2: Add Columns

#### Add "Comment" Column
1. Click **+ Add column** > **Multiple lines of text**
2. Name: `Comment`
3. Type: Plain text (or Rich text if needed)
4. Number of lines: 6
5. Require that this column contains information: **Yes**
6. Click **Save**

#### Add "IEP" Lookup Column
1. Click **+ Add column** > **Lookup**
2. Name: `IEP`
3. Get information from: **IEPs**
4. In this column: **Title**
5. Require that this column contains information: **Yes**
6. Enforce relationship behavior: **Cascade Delete**
7. Click **Save**

#### Add "Department" Lookup Column
1. Click **+ Add column** > **Lookup**
2. Name: `Department`
3. Get information from: **Departments**
4. In this column: **DepartmentName**
5. Require that this column contains information: **Yes**
6. Enforce relationship behavior: **Restrict Delete**
7. Click **Save**

#### Add "Parent Comment" Number Column
1. Click **+ Add column** > **Number**
2. Name: `Parent Comment`
3. Internal Name: `ParentCommentId`
4. Decimal places: 0
5. Require that this column contains information: **No**
6. Click **Save**

#### Add "Mentioned Users" Person Column
1. Click **+ Add column** > **Person**
2. Name: `Mentioned Users`
3. Allow multiple selections: **Yes**
4. Allow selection of: **People Only**
5. Choose from: **All Users**
6. Require that this column contains information: **No**
7. Click **Save**

### Step 3: Configure List Settings (Optional)
1. Go to **List Settings**
2. Under **Advanced settings**:
   - Enable **Require content approval for submitted items?**: No (unless needed)
   - Enable **Require Check Out**: No
3. Click **OK**

---

## Permissions

### Recommended Permission Settings
- **Contributors**: Can create, read, and edit their own items
- **Members/Department Users**: Can only see discussions for their department (filtered in code)
- **Owners/Admins**: Can see all discussions

### Security Note
The application code filters discussions by:
1. **IEP ID** - Only shows discussions for the specific IEP being viewed
2. **Department ID** - Only shows discussions for the user's department
3. **Author ID** - Only shows discussions created by the current user

This ensures data privacy and that users only see their own department's discussions.

---

## Data Flow

1. **User opens an IEP details page**
   - Discussion sidebar appears with a chat icon
   
2. **User clicks chat icon**
   - Sidebar opens and fetches discussions filtered by:
     - IEP ID
     - Department ID
     - Current User ID (shows only their comments)

3. **User adds a comment**
   - Can mention other users with @
   - Comment is saved with IEP ID, Department ID
   - Mentioned users are saved in MentionedUsers field

4. **User replies to a comment**
   - Reply is saved with ParentCommentId pointing to parent comment
   - Forms a threaded conversation structure

5. **Display logic**
   - Top-level comments (ParentCommentId is null/empty)
   - Nested replies (ParentCommentId matches parent comment ID)
   - User avatars, timestamps, expandable threads

---

## Sample Data Structure

### Top-Level Comment Example
```json
{
  "Id": 1,
  "Title": "",
  "Comment": "This IEP looks great! @John Smith what do you think?",
  "IEPId": 5,
  "DepartmentId": 3,
  "ParentCommentId": null,
  "MentionedUsers": [{"Id": 12, "Title": "John Smith"}],
  "Author": {"Id": 8, "Title": "Jane Doe"},
  "Created": "2025-11-24T10:30:00Z"
}
```

### Reply Example
```json
{
  "Id": 2,
  "Title": "",
  "Comment": "I agree! The performance measures are well-defined.",
  "IEPId": 5,
  "DepartmentId": 3,
  "ParentCommentId": 1,
  "MentionedUsers": [],
  "Author": {"Id": 12, "Title": "John Smith"},
  "Created": "2025-11-24T11:45:00Z"
}
```

---

## Testing Checklist

- [ ] Create IEPDiscussions list with all columns
- [ ] Verify IEP lookup works correctly
- [ ] Verify Department lookup works correctly
- [ ] Test adding a top-level comment
- [ ] Test adding a reply to a comment
- [ ] Test @mentions functionality
- [ ] Test that only user's own department discussions are shown
- [ ] Test threaded display (parent > replies)
- [ ] Test expand/collapse functionality
- [ ] Test on mobile and desktop views

---

## Notes

- The list uses **ParentCommentId** to create a parent-child relationship between comments and replies
- **MentionedUsers** is a multi-select Person field for @mentions
- **Department filtering** ensures users only see discussions relevant to their department
- **Author filtering** ensures users only see their own comments (as per requirements)
- The UI components handle the visual organization of threaded discussions
