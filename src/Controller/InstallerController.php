<?php

namespace App\Controller;

use App\Entity\Enum\AdServer;
use App\Entity\Enum\App;
use App\Exception\ServiceNotPresent;
use App\Exception\UnexpectedResponseException;
use App\Repository\ConfigurationRepository;
use App\Service\Installer\Step\BaseStep;
use App\Service\Installer\Step\ClassifierStep;
use App\Service\Installer\Step\DnsStep;
use App\Service\Installer\Step\LicenseStep;
use App\Service\Installer\Step\SmtpStep;
use App\Service\Installer\Step\StatusStep;
use App\Service\Installer\Step\WalletStep;
use App\ValueObject\AccountId;
use Psr\Container\ContainerExceptionInterface;
use Psr\Container\NotFoundExceptionInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api', name: 'api_')]
class InstallerController extends AbstractController
{
    #[Route('/step', name: 'previous_step', methods: ['GET'])]
    public function previousStep(ConfigurationRepository $repository): JsonResponse
    {
        $step = $repository->fetchValueByEnum(App::INSTALLER_STEP);

        return $this->json([App::INSTALLER_STEP->value => $step]);
    }

    #[Route('/step/{step}', name: 'get_step', methods: ['GET'])]
    public function getStep(string $step): JsonResponse
    {
        if (1 !== preg_match('/^[a-z]+$/', $step)) {
            throw new UnprocessableEntityHttpException(sprintf('Invalid step (%s)', $step));
        }

        try {
            $service = $this->container->get($step . '_step');
        } catch (NotFoundExceptionInterface | ContainerExceptionInterface) {
            throw new UnprocessableEntityHttpException(sprintf('Unsupported step (%s)', $step));
        }

        try {
            $data = $service->fetchData();
        } catch (UnexpectedResponseException | ServiceNotPresent $exception) {
            throw new HttpException(Response::HTTP_INTERNAL_SERVER_ERROR, $exception->getMessage());
        }

        return new JsonResponse(
            json_encode($data, JsonResponse::DEFAULT_ENCODING_OPTIONS | JSON_FORCE_OBJECT),
            Response::HTTP_OK,
            [],
            true
        );
    }

    #[Route('/step/{step}', name: 'set_step', methods: ['POST'])]
    public function setStep(string $step, Request $request): JsonResponse
    {
        if (1 !== preg_match('/^[a-z]+$/', $step)) {
            throw new UnprocessableEntityHttpException(sprintf('Invalid step (%s)', $step));
        }

        $content = json_decode($request->getContent(), true) ?? [];

        try {
            $service = $this->container->get($step . '_step');
        } catch (NotFoundExceptionInterface | ContainerExceptionInterface) {
            throw new UnprocessableEntityHttpException(sprintf('Unsupported step (%s)', $step));
        }

        try {
            $service->process($content);
        } catch (UnexpectedResponseException $exception) {
            throw new HttpException(Response::HTTP_INTERNAL_SERVER_ERROR, $exception->getMessage());
        }

        return $this->json(['message' => 'Data saved successfully']);
    }

    #[Route('/node_host', name: 'node_host', methods: ['POST'])]
    public function getNodeHost(Request $request, WalletStep $walletStep): JsonResponse
    {
        $content = json_decode($request->getContent(), true);
        if (
            !isset($content[AdServer::WALLET_ADDRESS->value]) ||
            !is_string($content[AdServer::WALLET_ADDRESS->value]) ||
            !AccountId::isValid($content[AdServer::WALLET_ADDRESS->value])
        ) {
            throw new UnprocessableEntityHttpException(
                sprintf('Field `%s` must be a valid ADS account', AdServer::WALLET_ADDRESS->value)
            );
        }

        $accountId = new AccountId($content[AdServer::WALLET_ADDRESS->value]);
        $nodeHost = $walletStep->getNodeHostByAccountAddress($accountId);

        return $this->json(
            [
                AdServer::WALLET_NODE_HOST->value => $nodeHost,
                AdServer::WALLET_NODE_PORT->value => '6511',
            ]
        );
    }

    #[Route('/license_key', name: 'set_license_key', methods: ['POST'])]
    public function setLicenseKey(Request $request, LicenseStep $licenseStep): Response
    {
        $content = json_decode($request->getContent(), true);
        $licenseStep->setLicenseKey($content);

        return $this->redirectToRoute('api_get_step', ['step' => 'license']);
    }

    #[Route('/community_license', name: 'claim_license', methods: ['GET'])]
    public function claimCommunityLicense(LicenseStep $licenseStep): Response
    {
        $licenseStep->claimCommunityLicense();

        return $this->redirectToRoute('api_get_step', ['step' => 'license']);
    }

    public static function getSubscribedServices(): array
    {
        return array_merge(parent::getSubscribedServices(), [
            'base_step' => BaseStep::class,
            'classifier_step' => ClassifierStep::class,
            'dns_step' => DnsStep::class,
            'license_step' => LicenseStep::class,
            'smtp_step' => SmtpStep::class,
            'status_step' => StatusStep::class,
            'wallet_step' => WalletStep::class,
        ]);
    }
}
