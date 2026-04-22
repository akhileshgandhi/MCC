import React from 'react'
import CustomMetropolitanCollegeDirectory from '../../../CustomComponents/MainParentComponent/CustomMetropolitanCollegeDirectory'
import "bootstrap/dist/css/bootstrap.min.css";
import { SPFI } from '@pnp/sp/presets/all';
import "../../../CustomAssets/CustomFonts/Figtree/Figtree-VariableFont_wght.ttf";
import "../../../CustomCss/main.scss";
import { getSP, getGraph } from '../loc/pnpjsConfig';
import { GraphFI } from '@pnp/graph';
import { IPuMsCustomMetropolitanCollegeDirectoryProps } from '../../../types/IPuMsCustomMetropolitanCollegeDirectoryProps';

const PuMsCustomMetropolitanCollegeDirectory = (props: IPuMsCustomMetropolitanCollegeDirectoryProps) => {
  const sp: SPFI = getSP();
  const graph: GraphFI = getGraph();
  return (
    <CustomMetropolitanCollegeDirectory sp={sp} graph={graph} role="PUMs" context={props.context} />
  )
}

export default PuMsCustomMetropolitanCollegeDirectory