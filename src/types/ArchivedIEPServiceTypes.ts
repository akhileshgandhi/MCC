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
