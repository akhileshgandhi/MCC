import { SPFI } from "@pnp/sp/presets/all";
import "@pnp/sp/files";
import "@pnp/sp/folders";

/**
 * Interface for archived IEP document
 */
export interface ArchivedIEPDocument {
  Id: number;
  Name: string;
  ServerRelativeUrl: string;
  TimeCreated: string;
  TimeLastModified: string;
  ModifiedBy: string;
  Length: number;
}

/**
 * Interface for archived IEP folder structure
 */
export interface ArchivedIEPFolder {
  Name: string;
  ServerRelativeUrl: string;
  ItemCount: number;
  Files?: ArchivedIEPDocument[];
  SubFolders?: ArchivedIEPFolder[];
}

/**
 * Interface for hierarchical archived IEP data
 */
export interface ArchivedIEPHierarchy {
  id: string;
  name: string;
  year: string;
  type: 'year' | 'department' | 'document';
  children?: ArchivedIEPHierarchy[];
  documentUrl?: string;
  itemCount?: number;
}

/**
 * Fetch all archived IEPs from SharePoint Document Library
 * Dynamically discovers all year folders, departments, and documents
 */
export async function getArchivedIEPs(
  _sp: SPFI,
  libraryName: string = "ArchiveIEPs"
): Promise<ArchivedIEPHierarchy[]> {
  try {
    console.log(`[ArchivedIEPs] ========== STARTING FETCH ==========`);
    console.log(`[ArchivedIEPs] Fetching from library: ${libraryName}`);
    
    const hierarchy: ArchivedIEPHierarchy[] = [];
    
    // Get the root folder of the library
    const rootFolder = await _sp.web.lists.getByTitle(libraryName).rootFolder();
    console.log('[ArchivedIEPs] Library root folder found:', rootFolder.ServerRelativeUrl);
    console.log('[ArchivedIEPs] Root folder object:', rootFolder);
    
    // Dynamically get all year folders from the library
    const yearFolders = await _sp.web.lists.getByTitle(libraryName).rootFolder.folders
      .select('Name', 'ServerRelativeUrl', 'ItemCount')
      .filter("Name ne 'Forms'")();
    
    console.log(`[ArchivedIEPs] Found ${yearFolders.length} year folders:`, yearFolders.map(f => f.Name));
    console.log(`[ArchivedIEPs] Year folders full data:`, yearFolders);
    
    // Process each year folder dynamically
    for (const yearFolder of yearFolders) {
      // Skip system folders
      if (yearFolder.Name.startsWith('_')) {
        continue;
      }
      
      // Extract year from folder name (e.g., "MCC (2020-2021)" -> "2020-2021")
      const yearMatch = yearFolder.Name.match(/\d{4}-\d{4}/);
      const year = yearMatch ? yearMatch[0] : yearFolder.Name;
      
      const yearNode: ArchivedIEPHierarchy = {
        id: `archive-year-${yearFolder.Name.replace(/[()\\s]/g, '-')}`,
        name: yearFolder.Name,
        year: year,
        type: 'year',
        children: []
      };
      
      console.log(`[ArchivedIEPs] Processing year: ${yearFolder.Name}`);
      
      try {
        // First, check if there are files directly in the year folder
        const yearFiles = await _sp.web.getFolderByServerRelativePath(yearFolder.ServerRelativeUrl).files
          .select('Name', 'ServerRelativeUrl', 'TimeCreated', 'Length')();
        
        console.log(`[ArchivedIEPs] Found ${yearFiles.length} files directly in ${yearFolder.Name}`);
        console.log(`[ArchivedIEPs] File names:`, yearFiles.map(f => f.Name));
        
        // If there are files in the year folder, treat them as documents without department grouping
        for (const file of yearFiles) {
          console.log(`[ArchivedIEPs] Checking file: ${file.Name}, ends with .pdf: ${file.Name.toLowerCase().endsWith('.pdf')}`);
          // Filter for PDF files (case insensitive)
          if (file.Name.toLowerCase().endsWith('.pdf')) {
            const docNode: ArchivedIEPHierarchy = {
              id: `archive-doc-${yearFolder.Name}-${file.Name}`.replace(/[()\\s]/g, '-'),
              name: file.Name.replace(/\.pdf$/i, ''),
              year: year,
              type: 'document',
              documentUrl: `${window.location.origin}${file.ServerRelativeUrl}`
            };
            
            console.log(`[ArchivedIEPs] Adding document to yearNode: ${docNode.name}`);
            yearNode.children!.push(docNode);
          }
        }
        
        console.log(`[ArchivedIEPs] yearNode children count after processing files: ${yearNode.children!.length}`);
        
        // Dynamically get all department folders within this year
        const deptFolders = await _sp.web.getFolderByServerRelativePath(yearFolder.ServerRelativeUrl).folders
          .select('Name', 'ServerRelativeUrl', 'ItemCount')();
        
        console.log(`[ArchivedIEPs] Found ${deptFolders.length} department folders in ${yearFolder.Name}`);
        
        for (const deptFolder of deptFolders) {
          // Skip system folders
          if (deptFolder.Name.startsWith('_') || deptFolder.Name === 'Forms') {
            console.log(`[ArchivedIEPs] Skipping system folder: ${deptFolder.Name}`);
            continue;
          }
          
          const deptNode: ArchivedIEPHierarchy = {
            id: `archive-dept-${yearFolder.Name}-${deptFolder.Name}`.replace(/[()\\s]/g, '-'),
            name: deptFolder.Name,
            year: year,
            type: 'department',
            children: []
          };
          
          try {
            // Get all files in this department folder (not just PDFs initially for debugging)
            const allFiles = await _sp.web.getFolderByServerRelativePath(deptFolder.ServerRelativeUrl).files
              .select('Name', 'ServerRelativeUrl', 'TimeCreated', 'Length')();
            
            console.log(`[ArchivedIEPs] Found ${allFiles.length} total files in ${deptFolder.Name}:`, allFiles.map(f => f.Name));
            
            // Filter for PDF files
            const files = allFiles.filter(f => f.Name.toLowerCase().endsWith('.pdf'));
            console.log(`[ArchivedIEPs] Found ${files.length} PDF files in ${deptFolder.Name}`);
            
            for (const file of files) {
              const docNode: ArchivedIEPHierarchy = {
                id: `archive-doc-${yearFolder.Name}-${deptFolder.Name}-${file.Name}`.replace(/[()\\s]/g, '-'),
                name: file.Name.replace(/\.pdf$/i, ''),
                year: year,
                type: 'document',
                documentUrl: `${window.location.origin}${file.ServerRelativeUrl}`
              };
              
              deptNode.children!.push(docNode);
            }
            
            // Only add department if it has documents
            if (deptNode.children!.length > 0) {
              deptNode.itemCount = deptNode.children!.length;
              yearNode.children!.push(deptNode);
            }
          } catch (fileErr) {
            console.error(`[ArchivedIEPs] Error fetching files from ${deptFolder.Name}:`, fileErr);
            console.error(`[ArchivedIEPs] Error details:`, fileErr);
          }
        }
        
        // Add year if it has documents or departments with documents
        if (yearNode.children!.length > 0) {
          hierarchy.push(yearNode);
        } else {
          console.log(`[ArchivedIEPs] Year ${yearFolder.Name} has no documents or departments with documents, skipping`);
        }
      } catch (deptErr) {
        console.error(`[ArchivedIEPs] Error fetching departments from ${yearFolder.Name}:`, deptErr);
        console.error(`[ArchivedIEPs] Error details:`, deptErr);
      }
    }
    
    // Sort years in descending order (newest first)
    hierarchy.sort((a, b) => {
      const yearA = a.year.split('-')[1] || a.year.split('-')[0]; // Get the second year from "2024-2025"
      const yearB = b.year.split('-')[1] || b.year.split('-')[0];
      return parseInt(yearB) - parseInt(yearA);
    });
    
    console.log('[ArchivedIEPs] Final hierarchy:', JSON.stringify(hierarchy, null, 2));
    return hierarchy;
    
  } catch (error) {
    console.error('[ArchivedIEPs] Error fetching archived IEPs:', error);
    console.error('[ArchivedIEPs] Make sure the library "ArchiveIEPs" exists and is accessible');
    return [];
  }
}



/**
 * Open archived document in a new window
 */
export function openArchivedDocument(documentUrl: string): void {
  if (documentUrl) {
    window.open(documentUrl, '_blank');
  }
}


