<?xml version="1.0" encoding="utf-8"?>
<feature xmlns:dm0="http://schemas.microsoft.com/VisualStudio/2008/DslTools/Core" dslVersion="1.0.0.0" Id="<%=featureId %>" featureId="<%=featureId %>" imageUrl="" scope="Site" solutionId="00000000-0000-0000-0000-000000000000" title="<%=webPartName%>" version="" deploymentPath="$SharePoint.Project.FileNameWithoutExtension$_$SharePoint.Feature.FileNameWithoutExtension$" xmlns="http://schemas.microsoft.com/VisualStudio/2008/SharePointTools/FeatureModel">
  <projectItems>
    <projectItemReference itemId="<%=codeModuleSpdataId%>" />
    <projectItemReference itemId="<%=webpartModuleSpdataId%>" />
  </projectItems>
</feature>