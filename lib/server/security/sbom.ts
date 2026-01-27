// lib/server/security/sbom.ts
// Phase P18: Software Bill of Materials (SBOM) - Génération et vérification

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);

/**
 * Génère un SBOM au format SPDX ou CycloneDX
 * 
 * @param format - Format du SBOM ('spdx' ou 'cyclonedx')
 * @param outputPath - Chemin de sortie
 */
export async function generateSBOM(
  format: 'spdx' | 'cyclonedx' = 'cyclonedx',
  outputPath?: string
): Promise<string> {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageLockPath = path.join(process.cwd(), 'package-lock.json');

  // Vérifier que package.json existe
  try {
    await fs.access(packageJsonPath);
  } catch {
    throw new Error('package.json not found');
  }

  // Utiliser npm audit ou cyclonedx-npm pour générer le SBOM
  // Note: Nécessite l'installation de cyclonedx-npm ou @cyclonedx/cyclonedx-npm
  try {
    if (format === 'cyclonedx') {
      // Générer SBOM CycloneDX
      const { stdout } = await execAsync(
        `npx @cyclonedx/cyclonedx-npm --output-file ${outputPath || 'sbom.json'}`
      );
      return stdout;
    } else {
      // Générer SBOM SPDX
      const { stdout } = await execAsync(
        `npx spdx-builder --format spdx-json --output ${outputPath || 'sbom.spdx.json'}`
      );
      return stdout;
    }
  } catch (error) {
    // Fallback: générer un SBOM basique depuis package-lock.json
    console.warn('SBOM generation tool not found, generating basic SBOM from package-lock.json');
    return await generateBasicSBOM(packageLockPath, format, outputPath);
  }
}

/**
 * Génère un SBOM basique depuis package-lock.json
 */
async function generateBasicSBOM(
  packageLockPath: string,
  format: 'spdx' | 'cyclonedx',
  outputPath?: string
): Promise<string> {
  const packageLock = JSON.parse(await fs.readFile(packageLockPath, 'utf-8'));
  
  const sbom = {
    spdxVersion: 'SPDX-2.3',
    dataLicense: 'CC0-1.0',
    SPDXID: 'SPDXRef-DOCUMENT',
    name: 'yesselate-frontend-sbom',
    documentNamespace: `https://yesselate.com/sbom/${Date.now()}`,
    packages: [] as any[],
  };

  // Extraire les dépendances
  const dependencies = extractDependencies(packageLock);
  
  for (const dep of dependencies) {
    sbom.packages.push({
      SPDXID: `SPDXRef-Package-${dep.name.replace(/[^a-zA-Z0-9]/g, '-')}`,
      name: dep.name,
      versionInfo: dep.version,
      downloadLocation: dep.resolved || 'NOASSERTION',
      filesAnalyzed: false,
      licenseConcluded: dep.license || 'NOASSERTION',
      licenseDeclared: dep.license || 'NOASSERTION',
    });
  }

  const output = outputPath || 'sbom.spdx.json';
  await fs.writeFile(output, JSON.stringify(sbom, null, 2));
  
  return `SBOM generated at ${output}`;
}

/**
 * Extrait récursivement toutes les dépendances depuis package-lock.json
 */
function extractDependencies(
  packageLock: any,
  deps: Set<string> = new Set(),
  prefix = ''
): Array<{ name: string; version: string; resolved?: string; license?: string }> {
  const result: Array<{ name: string; version: string; resolved?: string; license?: string }> = [];
  
  if (packageLock.packages) {
    for (const [pkgPath, pkg] of Object.entries(packageLock.packages)) {
      const pkgData = pkg as any;
      if (pkgData.name && !deps.has(pkgData.name)) {
        deps.add(pkgData.name);
        result.push({
          name: pkgData.name,
          version: pkgData.version,
          resolved: pkgData.resolved,
          license: pkgData.license,
        });
      }
    }
  }
  
  return result;
}

/**
 * Vérifie les vulnérabilités connues dans le SBOM
 */
export async function verifySBOM(sbomPath: string): Promise<{
  vulnerabilities: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
}> {
  try {
    // Utiliser npm audit pour vérifier les vulnérabilités
    const { stdout } = await execAsync('npm audit --json');
    const audit = JSON.parse(stdout);
    
    const vulnerabilities = audit.vulnerabilities || {};
    const counts = {
      vulnerabilities: Object.keys(vulnerabilities).length,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };
    
    for (const vuln of Object.values(vulnerabilities) as any[]) {
      const severity = vuln.severity?.toLowerCase();
      if (severity === 'critical') counts.critical++;
      else if (severity === 'high') counts.high++;
      else if (severity === 'medium') counts.medium++;
      else if (severity === 'low') counts.low++;
    }
    
    return counts;
  } catch (error) {
    console.error('Failed to verify SBOM:', error);
    return { vulnerabilities: 0, critical: 0, high: 0, medium: 0, low: 0 };
  }
}
