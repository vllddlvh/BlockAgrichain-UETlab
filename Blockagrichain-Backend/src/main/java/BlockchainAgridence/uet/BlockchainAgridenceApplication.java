package BlockchainAgridence.uet;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableCaching
public class BlockchainAgridenceApplication {

	public static void main(String[] args) {
		SpringApplication.run(BlockchainAgridenceApplication.class, args);
	}

}
