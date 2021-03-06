/**
 * Copyright (C) 2017 Red Hat, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package io.atlasmap.itests.core;

import java.io.File;
import java.io.InputStreamReader;
import java.net.URL;

import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;

import io.atlasmap.core.AtlasMappingService;
import io.atlasmap.core.DefaultAtlasContextFactory;
import io.atlasmap.v2.AtlasMapping;
import io.atlasmap.v2.BaseMapping;
import io.atlasmap.v2.Field;
import io.atlasmap.v2.Mapping;
import io.atlasmap.v2.MappingType;

public class AtlasMappingServiceTest {

    private AtlasMappingService mappingService;

    @Before
    public void before() {
        mappingService = DefaultAtlasContextFactory.getInstance().getMappingService();
    }

    @Test
    public void testMappingXML() throws Exception {
        URL url = Thread.currentThread().getContextClassLoader().getResource("mappings/atlasmapping.json");
        assertAtlasMapping(mappingService.loadMapping(url));
        assertAtlasMapping(mappingService.loadMapping(url.toURI()));
        assertAtlasMapping(mappingService.loadMapping(new File(url.toURI())));
        assertAtlasMapping(mappingService.loadMapping(url.openStream()));
        assertAtlasMapping(mappingService.loadMapping(new InputStreamReader(url.openStream())));
        File outputXml = new File("target/output-atlasmapping.xml");
        mappingService.saveMappingAsFile(mappingService.loadMapping(url), outputXml);
        assertAtlasMapping(mappingService.loadMapping(outputXml));
    }

    @Test
    public void testMappingXMLViaContext() throws Exception {
        URL url = Thread.currentThread().getContextClassLoader().getResource("mappings/atlasmapping.json");
        assertAtlasMapping(
                DefaultAtlasContextFactory.getInstance().createContext(url.toURI()).createSession().getMapping());
        assertAtlasMapping(DefaultAtlasContextFactory.getInstance().createContext(new File(url.toURI())).createSession()
                .getMapping());
        assertAtlasMapping(DefaultAtlasContextFactory.getInstance().createContext(url.toURI())
                .createSession().getMapping());
        assertAtlasMapping(DefaultAtlasContextFactory.getInstance()
                .createContext(new File(url.toURI())).createSession().getMapping());
    }

    @Test
    public void testMappingJSON() throws Exception {
        URL url = Thread.currentThread().getContextClassLoader().getResource("mappings/atlasmapping.json");
        assertAtlasMapping(mappingService.loadMapping(url));
        assertAtlasMapping(mappingService.loadMapping(url.toURI()));
        assertAtlasMapping(mappingService.loadMapping(new File(url.toURI())));
        assertAtlasMapping(mappingService.loadMapping(url.openStream()));
        assertAtlasMapping(
                mappingService.loadMapping(new InputStreamReader(url.openStream())));
        File outputJson = new File("target/output-atlasmapping.json");
        mappingService.saveMappingAsFile(mappingService.loadMapping(url), outputJson);
        assertAtlasMapping(mappingService.loadMapping(outputJson));
    }

    @Test
    public void testMappingJSONViaContext() throws Exception {
        URL url = Thread.currentThread().getContextClassLoader().getResource("mappings/atlasmapping.json");
        assertAtlasMapping(DefaultAtlasContextFactory.getInstance().createContext(url.toURI())
                .createSession().getMapping());
        assertAtlasMapping(DefaultAtlasContextFactory.getInstance()
                .createContext(new File(url.toURI())).createSession().getMapping());
    }

    private void assertAtlasMapping(AtlasMapping mapping) {
        Assert.assertNotNull(mapping);
        Assert.assertEquals("core.unit.test", mapping.getName());
        Assert.assertNotNull(mapping.getMappings());
        Assert.assertNotNull(mapping.getMappings().getMapping());
        Assert.assertNotNull(mapping.getMappings().getMapping().get(0));
        BaseMapping m = mapping.getMappings().getMapping().get(0);
        Assert.assertEquals(MappingType.MAP, m.getMappingType());
        Assert.assertEquals(Mapping.class, m.getClass());
        Assert.assertNotNull(((Mapping) m).getInputField());
        Field input = ((Mapping) m).getInputField().get(0);
        Assert.assertEquals("/orderId", input.getPath());
        Assert.assertNotNull(((Mapping) m).getOutputField());
        Field output = ((Mapping) m).getOutputField().get(0);
        Assert.assertEquals("/orderId", output.getPath());
    }
}
