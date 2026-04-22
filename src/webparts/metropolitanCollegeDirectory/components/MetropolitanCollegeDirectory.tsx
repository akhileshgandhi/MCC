import React from 'react'
import CustomMetropolitanCollegeDirectory from '../../../CustomComponents/MainParentComponent/CustomMetropolitanCollegeDirectory'
import "bootstrap/dist/css/bootstrap.min.css";
import { getSP, getGraph } from '../loc/pnpjsConfig';
import { SPFI } from '@pnp/sp/presets/all';
import { GraphFI } from '@pnp/graph';
import { IMetropolitanCollegeDirectoryProps } from '../../../types/IMetropolitanCollegeDirectoryProps';
import "../../../CustomAssets/CustomFonts/Figtree/Figtree-VariableFont_wght.ttf";
import "../../../CustomCss/main.scss";
const MetropolitanCollegeDirectory = (props: IMetropolitanCollegeDirectoryProps) => {
  const sp: SPFI = getSP();
  const graph: GraphFI = getGraph();
  return (
    <CustomMetropolitanCollegeDirectory sp={sp} graph={graph} role="PD" context={props.context} />
  )
}

export default MetropolitanCollegeDirectory