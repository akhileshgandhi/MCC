import { SPFI } from '@pnp/sp';
import { GraphFI } from '@pnp/graph';

export interface ICustomMetropolitanCollegeDirectoryProps {
  sp: SPFI;
  graph: GraphFI;
  role: string;
  context?: any;
}
