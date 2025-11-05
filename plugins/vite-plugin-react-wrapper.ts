import type { Plugin } from 'vite';
import { resolve, join, relative } from 'path';
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'fs';

interface ComponentInfo {
  componentName: string;    // 클래스명 (예: Button)
  reactName: string;         // React 컴포넌트명 (예: UButton)
  tagName: string;          // 태그명 (예: u-button)
  filePath: string;         // 원본 파일 경로
  relativePath: string;     // src 기준 상대 경로
}

interface PluginOptions {
  /**
   * 컴포넌트가 위치한 폴더 경로 (기본값: 'src/components')
   */
  componentsDir?: string;
  
  /**
   * React 래퍼를 생성할 출력 폴더 (기본값: 'dist/react')
   * 빌드 outDir 내부에 생성됩니다
   */
  outDir?: string;
  
  /**
   * 빌드된 컴포넌트 파일들의 기준 경로 (기본값: '.')
   * 생성되는 import 문에서 사용됩니다
   */
  distDir?: string;
}

/**
 * Lit Element 컴포넌트를 React 래퍼 컴포넌트로 자동 생성하는 Vite 플러그인
 */
export default function reactWrapperPlugin(options: PluginOptions = {}): Plugin {
  let rootDir: string;
  let buildOutDir: string;
  let componentsDir: string;
  let outDir: string;
  let distDir: string;

  return {
    name: 'vite-plugin-react-wrapper',
    
    configResolved(config) {
      rootDir = config.root;
      buildOutDir = resolve(rootDir, config.build.outDir);
      
      // 옵션에서 componentsDir 가져오기 또는 기본값
      const componentsDirPath = options.componentsDir || 'src/components';
      componentsDir = resolve(rootDir, componentsDirPath);
      
      // 옵션에서 outDir 가져오기 또는 기본값 (빌드 폴더 내부)
      const outDirPath = options.outDir || 'react-components';
      outDir = resolve(buildOutDir, outDirPath);
      
      // 옵션에서 distDir 가져오기 또는 기본값
      distDir = options.distDir || '.';
    },

    closeBundle() {
      console.log('\n🔄 Generating React wrapper components...\n');
      
      try {
        // react-components 폴더 생성
        if (!existsSync(outDir)) {
          mkdirSync(outDir, { recursive: true });
        }

        // 컴포넌트 정보 수집
        const components = collectComponents(componentsDir);
        
        if (components.length === 0) {
          console.warn('⚠️  No components found to wrap');
          return;
        }

        console.log(`📦 Found ${components.length} components to wrap\n`);

        // 각 컴포넌트의 React 래퍼 생성
        components.forEach(component => {
          generateReactWrapper(component, outDir, distDir);
        });

        // index.ts 생성
        generateIndexFile(components, outDir);

        console.log('\n✅ React wrapper components generated successfully!\n');
        
      } catch (error) {
        console.error('❌ Error generating React wrappers:', error);
        throw error;
      }
    }
  };
}

/**
 * components 폴더에서 모든 컴포넌트 정보 수집
 */
function collectComponents(componentsDir: string): ComponentInfo[] {
  const components: ComponentInfo[] = [];
  
  // components 폴더의 하위 디렉토리 순회
  const entries = readdirSync(componentsDir);
  
  for (const entry of entries) {
    const entryPath = join(componentsDir, entry);
    const stat = statSync(entryPath);
    
    // 디렉토리인 경우에만 처리
    if (stat.isDirectory()) {
      const indexPath = join(entryPath, 'index.ts');
      
      if (existsSync(indexPath)) {
        const content = readFileSync(indexPath, 'utf-8');
        const componentInfo = parseComponentInfo(content, entry, indexPath);
        
        if (componentInfo) {
          components.push(componentInfo);
        }
      }
    }
  }
  
  return components;
}

/**
 * 컴포넌트 index.ts 파일에서 정보 추출
 */
function parseComponentInfo(content: string, folderName: string, filePath: string): ComponentInfo | null {
  // 클래스명 추출 (예: export { Button, UButton })
  const exportMatch = content.match(/export\s*\{\s*([^,\s]+)\s*,\s*U([^}\s]+)\s*\}/);
  if (!exportMatch) {
    return null;
  }
  
  const componentName = exportMatch[1]; // Button
  const reactNameSuffix = exportMatch[2]; // Button
  const reactName = `U${reactNameSuffix}`; // UButton
  
  // 태그명 추출 (예: Button.define("u-button"))
  const tagMatch = content.match(/\.define\s*\(\s*["']([^"']+)["']/);
  if (!tagMatch) {
    return null;
  }
  
  const tagName = tagMatch[1]; // u-button
  
  return {
    componentName,
    reactName,
    tagName,
    filePath,
    relativePath: `components/${folderName}`
  };
}

/**
 * 개별 컴포넌트의 React 래퍼 파일 생성
 */
function generateReactWrapper(component: ComponentInfo, outDir: string, distDir: string): void {
  const { reactName, componentName, tagName, relativePath } = component;
  
  // import 경로 계산 (상대 경로)
  // outDir에서 distDir/relativePath로의 상대 경로를 계산
  const targetPath = resolve(outDir, '..', distDir, relativePath);
  let importPath = relative(outDir, targetPath).replace(/\\/g, '/');
  
  // 상대 경로가 ./ 또는 ../로 시작하지 않으면 추가
  if (!importPath.startsWith('.')) {
    importPath = './' + importPath;
  }
  
  // .js 파일 생성
  const jsFileName = `${reactName}.js`;
  const jsFilePath = join(outDir, jsFileName);
  
  const jsContent = `import React from 'react';
import { createComponent } from '@lit/react';
import { ${componentName} } from '${importPath}';

export const ${reactName} = createComponent({
  react: React,
  tagName: '${tagName}',
  elementClass: ${componentName},
  events: {}
});
`;

  writeFileSync(jsFilePath, jsContent, 'utf-8');
  console.log(`  ✓ Generated ${jsFileName}`);
  
  // .d.ts 파일 생성
  const dtsFileName = `${reactName}.d.ts`;
  const dtsFilePath = join(outDir, dtsFileName);
  
  const dtsContent = `import React from 'react';
import { ${componentName} } from '${importPath}';

export declare const ${reactName}: React.ForwardRefExoticComponent<
  Partial<${componentName}> & React.HTMLAttributes<${componentName}>
>;

export type ${reactName}Props = React.ComponentProps<typeof ${reactName}>;
`;

  writeFileSync(dtsFilePath, dtsContent, 'utf-8');
  console.log(`  ✓ Generated ${dtsFileName}`);
}

/**
 * index 파일 생성 (모든 React 래퍼 export)
 */
function generateIndexFile(components: ComponentInfo[], outDir: string): void {
  const exports = components
    .map(c => `export { ${c.reactName} } from './${c.reactName}.js';`)
    .join('\n');
  
  // index.js 생성
  const jsContent = `${exports}
`;

  const jsIndexPath = join(outDir, 'index.js');
  writeFileSync(jsIndexPath, jsContent, 'utf-8');
  console.log(`  ✓ Generated index.js`);
  
  // index.d.ts 생성
  const dtsExports = components
    .map(c => `export { ${c.reactName}, ${c.reactName}Props } from './${c.reactName}';`)
    .join('\n');
  
  const dtsContent = `/**
 * React wrapper components for @iyulab/components
 * 
 * This file is automatically generated.
 * Each component is prefixed with 'U' (e.g., UButton, UInput, etc.)
 */

${dtsExports}
`;

  const dtsIndexPath = join(outDir, 'index.d.ts');
  writeFileSync(dtsIndexPath, dtsContent, 'utf-8');
  console.log(`  ✓ Generated index.d.ts`);
}
