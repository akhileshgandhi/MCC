import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'PuMsCustomMetropolitanCollegeDirectoryWebPartStrings';
import PuMsCustomMetropolitanCollegeDirectory from './components/PuMsCustomMetropolitanCollegeDirectory';
import { IPuMsCustomMetropolitanCollegeDirectoryProps } from '../../types/IPuMsCustomMetropolitanCollegeDirectoryProps';
import { getSP, getGraph } from './loc/pnpjsConfig';

export interface IPuMsCustomMetropolitanCollegeDirectoryWebPartProps {
  description: string;
}

export default class PuMsCustomMetropolitanCollegeDirectoryWebPart extends BaseClientSideWebPart<IPuMsCustomMetropolitanCollegeDirectoryWebPartProps> {

  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = '';
  private _onPopState: ((ev: PopStateEvent) => any) | null = null;

  public render(): void {
    const element: React.ReactElement<IPuMsCustomMetropolitanCollegeDirectoryProps> = React.createElement(
      PuMsCustomMetropolitanCollegeDirectory,
      {
        description: this.properties.description,
        isDarkTheme: this._isDarkTheme,
        environmentMessage: this._environmentMessage,
        hasTeamsContext: !!this.context.sdks.microsoftTeams,
        userDisplayName: this.context.pageContext.user.displayName,
        context: this.context,
        siteUrl: this.context.pageContext.web.absoluteUrl
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected async onInit(): Promise<void> {
    this._environmentMessage = this._getEnvironmentMessage();

    await super.onInit();
    getSP(this.context);
    getGraph(this.context);

    // Disable browser back navigation while this webpart is active
    if (typeof window !== 'undefined' && 'history' in window) {
      try {
        window.history.pushState(null, '', window.location.href);
      } catch (e) {
        // ignore
      }
      this._onPopState = () => {
        try {
          window.history.go(1);
        } catch (e) {
          // ignore
        }
      };
      window.addEventListener('popstate', this._onPopState);
    }
  }
  private _getEnvironmentMessage(): string {
    if (!!this.context.sdks.microsoftTeams) { // running in Teams
      return this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentTeams : strings.AppTeamsTabEnvironment;
    }

    return this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentSharePoint : strings.AppSharePointEnvironment;
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }


  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
    if (this._onPopState) {
      window.removeEventListener('popstate', this._onPopState);
      this._onPopState = null;
    }
  }


  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}